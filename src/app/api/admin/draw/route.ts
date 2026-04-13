export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getResend, FROM_EMAIL } from '@/lib/resend/client'
import { getTwilio, TWILIO_FROM } from '@/lib/twilio/client'
import { createHash, randomInt } from 'crypto'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

const WINNER_QUOTES: { text: string; author: string }[] = [
  { text: 'Fortune favors the bold.', author: 'Virgil' },
  { text: 'Luck is the residue of design.', author: 'Branch Rickey' },
  { text: "I've found that luck is quite predictable. If you want more luck, take more chances, be more active, show up more often.", author: 'Brian Tracy' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Opportunities multiply as they are seized.', author: 'Sun Tzu' },
  { text: 'It is not in the stars to hold our destiny but in ourselves.', author: 'William Shakespeare' },
  { text: 'Diligence is the mother of good luck.', author: 'Benjamin Franklin' },
  { text: 'Luck affects everything; let your hook always be cast. In the stream where you least expect it, there will be fish.', author: 'Ovid' },
  { text: 'The moment you doubt whether you can fly, you cease forever to be able to do it.', author: 'J.M. Barrie, Peter Pan' },
  { text: 'Go and wake up your luck.', author: 'Persian proverb' },
]

function pickQuote(): { text: string; author: string } {
  return WINNER_QUOTES[randomInt(0, WINNER_QUOTES.length)]
}

export async function POST(request: NextRequest) {
  // Cookie-based auth for admin UI
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (!session || session !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { drop_id } = await request.json()
  if (!drop_id) {
    return NextResponse.json({ error: 'drop_id required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: drop } = await supabase
    .from('drops')
    .select('id, status')
    .eq('id', drop_id)
    .single()

  if (!drop) return NextResponse.json({ error: 'Drop not found' }, { status: 404 })
  if (drop.status !== 'active') return NextResponse.json({ error: `Drop is already ${drop.status}` }, { status: 400 })

  const { data: existingWinner } = await supabase
    .from('winners')
    .select('id')
    .eq('drop_id', drop_id)
    .single()

  if (existingWinner) return NextResponse.json({ error: 'Winner already drawn' }, { status: 409 })

  const { data: entries } = await supabase
    .from('entries')
    .select('id, user_id, spots_count')
    .eq('drop_id', drop_id)
    .order('created_at', { ascending: true })

  if (!entries || entries.length === 0) {
    return NextResponse.json({ error: 'No entries found' }, { status: 400 })
  }

  const ticketPool: string[] = []
  const entryIds: string[] = []

  for (const entry of entries) {
    entryIds.push(entry.id)
    for (let i = 0; i < entry.spots_count; i++) {
      ticketPool.push(entry.user_id)
    }
  }

  const totalTickets = ticketPool.length
  const winningTicket = randomInt(0, totalTickets)
  const winnerId = ticketPool[winningTicket]

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

  const { error: winnerError } = await supabase.from('winners').insert({
    drop_id,
    user_id: winnerId,
    total_tickets: totalTickets,
    winning_ticket: winningTicket,
    verification_hash: verificationHash,
    draw_inputs: drawInputs,
  })

  if (winnerError) {
    console.error('[admin/draw] Winner insert failed', winnerError)
    return NextResponse.json({ error: 'Failed to record winner' }, { status: 500 })
  }

  await supabase.from('drops').update({ status: 'closed' }).eq('id', drop_id)

  const { data: winnerUser } = await supabase
    .from('users')
    .select('email, phone')
    .eq('id', winnerId)
    .single()

  if (winnerUser?.email) {
    const ticketId = verificationHash.slice(0, 8).toUpperCase()
    const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dedstok-web.vercel.app'}/verify/${drop_id}`
    const quote = pickQuote()

    try {
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: winnerUser.email,
        subject: `You won — DEDSTOK`,
        html: `
          <div style="background:#0c0a09;color:#f5ede0;font-family:sans-serif;padding:40px;max-width:500px;margin:0 auto;">
            <h1 style="color:#CA8A04;font-size:28px;margin-bottom:8px;">DEDSTOK</h1>
            <p style="color:rgba(245,237,224,0.55);font-size:12px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:32px;">You Won</p>
            <p style="color:rgba(245,237,224,0.85);font-size:16px;margin-bottom:8px;line-height:1.6;">
              Congratulations. Your ticket <strong style="color:#CA8A04;">#${ticketId}</strong> was drawn.
            </p>
            <p style="color:rgba(245,237,224,0.6);font-size:14px;margin-bottom:32px;line-height:1.6;">
              We will contact you shortly to arrange delivery.
            </p>
            <div style="background:rgba(245,237,224,0.05);border-radius:4px;padding:16px;margin-bottom:16px;">
              <p style="color:rgba(245,237,224,0.4);font-size:11px;margin:0 0 4px;">Winning ticket</p>
              <p style="color:#f5ede0;font-size:14px;margin:0;">#${ticketId} &mdash; drawn ${winningTicket + 1} of ${totalTickets} total tickets (1 in ${totalTickets} odds)</p>
            </div>
            <div style="background:rgba(245,237,224,0.05);border-radius:4px;padding:16px;margin-bottom:8px;">
              <p style="color:rgba(245,237,224,0.4);font-size:11px;margin:0 0 4px;">Verification hash</p>
              <p style="color:#f5ede0;font-size:11px;font-family:monospace;word-break:break-all;margin:0 0 10px;">${verificationHash}</p>
              <a href="${verifyUrl}" style="color:#CA8A04;font-size:11px;text-decoration:none;letter-spacing:0.1em;">Verify this draw on DEDSTOK &rarr;</a>
            </div>
            <p style="color:rgba(245,237,224,0.2);font-size:10px;margin-top:4px;margin-bottom:32px;">
              Anyone can verify this draw was fair using the hash and entry data above.
            </p>
            <div style="border-left:2px solid rgba(202,138,4,0.4);padding:12px 16px;margin-bottom:32px;">
              <p style="color:rgba(245,237,224,0.7);font-size:14px;font-style:italic;line-height:1.6;margin:0 0 8px;">"${quote.text}"</p>
              <p style="color:rgba(245,237,224,0.35);font-size:11px;margin:0;">— ${quote.author}</p>
            </div>
            <p style="color:rgba(245,237,224,0.4);font-size:11px;">One drop. One winner. Every week.</p>
          </div>
        `,
      })
    } catch (err) {
      console.error('[admin/draw] Winner email failed:', err)
    }
  }

  if (winnerUser?.phone) {
    try {
      await getTwilio().messages.create({
        from: TWILIO_FROM,
        to: winnerUser.phone,
        body: `DEDSTOK: You won this week's drop. Ticket ${winningTicket + 1} of ${totalTickets}. Check your email for next steps.`,
      })
    } catch (err) {
      console.error('[admin/draw] Winner SMS failed:', err)
    }
  }

  return NextResponse.json({
    success: true,
    winner_id: winnerId,
    winner_email: winnerUser?.email,
    winning_ticket: winningTicket + 1,
    total_tickets: totalTickets,
    verification_hash: verificationHash,
  })
}
