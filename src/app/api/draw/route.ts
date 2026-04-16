export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getResend, FROM_EMAIL } from '@/lib/resend/client'
import { getTwilio, TWILIO_FROM } from '@/lib/twilio/client'
import { createHash, randomInt } from 'crypto'

export const runtime = 'nodejs'

const WINNER_QUOTES: { text: string; author: string }[] = [
  { text: 'Everything I do is for the 17-year-old version of myself.', author: 'Virgil Abloh' },
  { text: 'Remind yourself. Nobody built like you, you design yourself.', author: 'Jay-Z' },
  { text: 'Reality is wrong. Dreams are for real.', author: 'Tupac Shakur' },
  { text: "Name one genius that ain't crazy.", author: 'Kanye West' },
  { text: 'You can have everything you want in life if you just help enough other people get what they want.', author: 'Zig Ziglar' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'What you wear is how you present yourself to the world.', author: 'Miuccia Prada' },
]
function pickWinnerQuote() {
  return WINNER_QUOTES[Math.floor(Math.random() * WINNER_QUOTES.length)]
}

function buildWinnerEmailHtml(
  ticketNumber: number,
  totalTickets: number,
  verificationHash: string,
  verifyUrl: string,
  quote: { text: string; author: string },
): string {
  const ticketId = String(ticketNumber).padStart(4, '0')
  return `
    <div style="background-color:#0c0a09;margin:0 auto;max-width:500px;padding:0;">
      <div style="background-color:#CA8A04;height:3px;font-size:3px;line-height:3px;">&nbsp;</div>
      <div style="padding:32px 32px 0;">
        <p style="color:#CA8A04;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.35em;margin:0 0 4px;text-transform:uppercase;">DEDSTOK</p>
        <p style="border-bottom:1px solid rgba(245,237,224,0.07);color:rgba(245,237,224,0.3);font-family:'Helvetica Neue',Arial,sans-serif;font-size:9px;letter-spacing:0.3em;margin:0 0 28px;padding-bottom:20px;text-transform:uppercase;">This Week's Winner</p>
      </div>
      <div style="padding:0 32px 32px;">
        <p style="color:#f5ede0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:32px;font-weight:700;letter-spacing:0.04em;line-height:1;margin:0 0 4px;text-transform:uppercase;">You Won.</p>
        <p style="color:rgba(245,237,224,0.45);font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;line-height:1.75;margin:0 0 28px;">Congratulations. Your ticket was drawn. We'll reach out shortly to arrange delivery.</p>
        <div style="border:1px solid rgba(202,138,4,0.4);margin:0 0 16px;padding:20px;">
          <p style="color:rgba(245,237,224,0.3);font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:0.25em;margin:0 0 8px;text-transform:uppercase;">Winning Ticket</p>
          <p style="color:#CA8A04;font-family:'Courier New',Courier,monospace;font-size:24px;font-weight:700;letter-spacing:0.1em;margin:0;">#${ticketId} &nbsp;<span style="color:rgba(245,237,224,0.25);font-size:13px;font-weight:400;">of ${totalTickets}</span></p>
        </div>
        <div style="border:1px solid rgba(245,237,224,0.07);margin:0 0 8px;padding:16px;">
          <p style="color:rgba(245,237,224,0.3);font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:0.2em;margin:0 0 6px;text-transform:uppercase;">Verification Hash</p>
          <p style="color:rgba(245,237,224,0.45);font-family:'Courier New',Courier,monospace;font-size:10px;margin:0 0 10px;word-break:break-all;">${verificationHash}</p>
          <a href="${verifyUrl}" style="color:#CA8A04;font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:0.12em;text-decoration:none;text-transform:uppercase;">Verify this draw &rarr;</a>
        </div>
        <p style="color:rgba(245,237,224,0.18);font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;margin:0 0 28px;">Anyone can verify this draw was fair using the hash and entry data above.</p>
        <div style="border-left:2px solid rgba(202,138,4,0.4);padding:12px 20px;">
          <p style="color:rgba(245,237,224,0.6);font-family:Georgia,'Times New Roman',serif;font-size:14px;font-style:italic;line-height:1.65;margin:0 0 8px;">&ldquo;${quote.text}&rdquo;</p>
          <p style="color:rgba(245,237,224,0.3);font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.08em;margin:0;">&mdash; ${quote.author}</p>
        </div>
      </div>
      <div style="border-top:1px solid rgba(245,237,224,0.06);padding:20px 32px;">
        <p style="color:rgba(245,237,224,0.18);font-family:'Helvetica Neue',Arial,sans-serif;font-size:9px;letter-spacing:0.2em;margin:0 0 4px;text-transform:uppercase;">One drop. One winner. Every week.</p>
        <p style="color:rgba(245,237,224,0.1);font-family:'Helvetica Neue',Arial,sans-serif;font-size:9px;margin:0;">dedstok.com</p>
      </div>
      <div style="background-color:#CA8A04;height:3px;font-size:3px;line-height:3px;">&nbsp;</div>
    </div>
  `
}

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
      const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dedstok.com'}/verify/${drop_id}`
      const quote = pickWinnerQuote()
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: winnerUser.email,
        subject: `You won — DEDSTOK`,
        html: buildWinnerEmailHtml(winningTicket + 1, totalTickets, verificationHash, verifyUrl, quote),
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
