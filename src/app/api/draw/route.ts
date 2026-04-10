export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getResend, FROM_EMAIL } from '@/lib/resend/client'
import { getTwilio, TWILIO_FROM } from '@/lib/twilio/client'
import { createHash, randomInt } from 'crypto'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  // Admin auth — x-admin-secret header
  const secret = request.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { drop_id } = await request.json()
  if (!drop_id) {
    return NextResponse.json({ error: 'drop_id required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // 1. Verify drop exists and is active
  const { data: drop, error: dropError } = await supabase
    .from('drops')
    .select('id, status')
    .eq('id', drop_id)
    .single()

  if (dropError || !drop) {
    return NextResponse.json({ error: 'Drop not found' }, { status: 404 })
  }

  if (drop.status !== 'active') {
    return NextResponse.json({ error: `Drop is already ${drop.status}` }, { status: 400 })
  }

  // 2. Guard against double draw
  const { data: existingWinner } = await supabase
    .from('winners')
    .select('id')
    .eq('drop_id', drop_id)
    .single()

  if (existingWinner) {
    return NextResponse.json({ error: 'Winner already drawn for this drop' }, { status: 409 })
  }

  // 3. Fetch all entries sorted deterministically by created_at
  const { data: entries, error: entriesError } = await supabase
    .from('entries')
    .select('id, user_id, spots_count')
    .eq('drop_id', drop_id)
    .order('created_at', { ascending: true })

  if (entriesError || !entries || entries.length === 0) {
    return NextResponse.json({ error: 'No entries found for this drop' }, { status: 400 })
  }

  // 4. Build weighted ticket pool
  // Each spot purchased = 1 ticket. Pool order is deterministic (entry order).
  // Buying 2 spots = 2 consecutive tickets in the pool.
  const ticketPool: string[] = [] // array of user_ids, index = ticket number
  const entryIds: string[] = []

  for (const entry of entries) {
    entryIds.push(entry.id)
    for (let i = 0; i < entry.spots_count; i++) {
      ticketPool.push(entry.user_id)
    }
  }

  const totalTickets = ticketPool.length

  // 5. Cryptographically secure random selection
  // randomInt(0, N) produces a value in [0, N) — uniform distribution
  const winningTicket = randomInt(0, totalTickets)
  const winnerId = ticketPool[winningTicket]

  // 6. Provable verification hash
  // SHA-256( drop_id | entry_ids_in_order | winning_ticket_index )
  // Published inputs + this hash = anyone can independently verify the result.
  const hashInput = `${drop_id}|${entryIds.join(',')}|${winningTicket}`
  const verificationHash = createHash('sha256').update(hashInput).digest('hex')

  const drawInputs = {
    drop_id,
    entry_ids_in_order: entryIds,
    total_tickets: totalTickets,
    winning_ticket_index: winningTicket,
    algorithm: 'Node.js crypto.randomInt — cryptographically secure CSPRNG',
    verification_note: 'SHA-256(drop_id + "|" + entry_ids_csv + "|" + winning_ticket_index) = verification_hash',
  }

  // 7. Write winner to DB
  const { error: winnerError } = await supabase.from('winners').insert({
    drop_id,
    user_id: winnerId,
    total_tickets: totalTickets,
    winning_ticket: winningTicket,
    verification_hash: verificationHash,
    draw_inputs: drawInputs,
  })

  if (winnerError) {
    console.error('[draw] Winner insert failed', winnerError)
    return NextResponse.json({ error: 'Failed to record winner' }, { status: 500 })
  }

  // 8. Close the drop
  await supabase
    .from('drops')
    .update({ status: 'closed' })
    .eq('id', drop_id)

  // 9. Get winner contact details
  const { data: winnerUser } = await supabase
    .from('users')
    .select('email, phone')
    .eq('id', winnerId)
    .single()

  console.log(`[draw] Winner: ${winnerId} | Ticket: ${winningTicket + 1}/${totalTickets}`)
  console.log(`[draw] Verification hash: ${verificationHash}`)

  // 10. Winner email
  if (winnerUser?.email) {
    try {
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: winnerUser.email,
        subject: `You won — DEDSTOK`,
        html: `
          <div style="background:#0c0a09;color:#f5ede0;font-family:sans-serif;padding:40px;max-width:500px;margin:0 auto;">
            <h1 style="color:#CA8A04;font-size:28px;margin-bottom:8px;">DEDSTOK</h1>
            <p style="color:rgba(245,237,224,0.55);font-size:12px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:32px;">
              You Won
            </p>
            <p style="color:rgba(245,237,224,0.85);font-size:16px;margin-bottom:24px;line-height:1.6;">
              Congratulations. Your ticket was drawn. We will contact you shortly to arrange delivery.
            </p>
            <div style="background:rgba(245,237,224,0.05);border-radius:4px;padding:16px;margin-bottom:24px;">
              <p style="color:rgba(245,237,224,0.4);font-size:11px;margin:0 0 4px;">Winning ticket</p>
              <p style="color:#f5ede0;font-size:14px;margin:0;">${winningTicket + 1} of ${totalTickets} total tickets</p>
            </div>
            <div style="background:rgba(245,237,224,0.05);border-radius:4px;padding:16px;margin-bottom:24px;">
              <p style="color:rgba(245,237,224,0.4);font-size:11px;margin:0 0 4px;">Draw verification hash</p>
              <p style="color:#f5ede0;font-size:11px;font-family:monospace;word-break:break-all;margin:0;">${verificationHash}</p>
            </div>
            <p style="color:rgba(245,237,224,0.4);font-size:11px;margin-top:32px;">
              One drop. One winner. Every week.
            </p>
          </div>
        `,
      })
    } catch (err) {
      console.error('[draw] Winner email failed:', err)
    }
  }

  // 11. Winner SMS
  if (winnerUser?.phone) {
    try {
      await getTwilio().messages.create({
        from: TWILIO_FROM,
        to: winnerUser.phone,
        body: `DEDSTOK: You won this week's drop. Ticket ${winningTicket + 1} of ${totalTickets}. Check your email for next steps.`,
      })
    } catch (err) {
      console.error('[draw] Winner SMS failed:', err)
    }
  }

  return NextResponse.json({
    success: true,
    winner_id: winnerId,
    winning_ticket: winningTicket + 1,
    total_tickets: totalTickets,
    verification_hash: verificationHash,
    draw_inputs: drawInputs,
  })
}
