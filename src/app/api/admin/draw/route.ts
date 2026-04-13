export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getResend, FROM_EMAIL } from '@/lib/resend/client'
import { getTwilio, TWILIO_FROM } from '@/lib/twilio/client'
import { createHash, randomInt } from 'crypto'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

const WINNER_QUOTES: { text: string; author: string }[] = [
  // Culture / streetwear / rap
  { text: 'Everything I do is for the 17-year-old version of myself.', author: 'Virgil Abloh' },
  { text: 'I see things that other people don\'t see. And I\'m not afraid to say them.', author: 'Virgil Abloh' },
  { text: 'Fashion should be a form of escapism, and not a form of imprisonment.', author: 'Raf Simons' },
  { text: 'Remind yourself. Nobody built like you, you design yourself.', author: 'Jay-Z, The Black Album' },
  { text: 'Reality is wrong. Dreams are for real.', author: 'Tupac Shakur' },
  { text: "Name one genius that ain't crazy.", author: 'Kanye West' },
  { text: "I'm not a businessman, I'm a business, man.", author: 'Jay-Z, Diamonds from Sierra Leone Remix' },
  { text: 'The marathon continues.', author: 'Nipsey Hussle' },
  { text: "We've never tried to be cool. If you try to be cool, it's always a mistake.", author: 'James Jebbia, founder of Supreme' },
  { text: 'I try to make all the beautiful things I always wanted but couldn\'t afford when I was young.', author: 'Rick Owens' },
  { text: "I don't follow trends. I set them.", author: 'A$AP Rocky' },
  { text: 'In order to be irreplaceable, one must always be different.', author: 'Coco Chanel' },
  { text: 'Invest in yourself. The returns are tremendous.', author: 'Nipsey Hussle' },
  { text: 'The world is yours.', author: 'Nas, Illmatic' },
  // Classic / literary
  { text: 'Fortune favors the bold.', author: 'Virgil' },
  { text: 'Luck is the residue of design.', author: 'Branch Rickey' },
  { text: "I've found that luck is quite predictable. If you want more luck, take more chances, be more active, show up more often.", author: 'Brian Tracy' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Opportunities multiply as they are seized.', author: 'Sun Tzu, The Art of War' },
  { text: 'Diligence is the mother of good luck.', author: 'Benjamin Franklin' },
  { text: 'Luck affects everything; let your hook always be cast. In the stream where you least expect it, there will be fish.', author: 'Ovid' },
  { text: 'The moment you doubt whether you can fly, you cease forever to be able to do it.', author: 'J.M. Barrie, Peter Pan' },
  { text: 'Luck is not chance, it\'s toil; fortune\'s expensive smile is earned.', author: 'Emily Dickinson' },
  { text: 'Les choses les plus rares au monde, après l\'esprit de discernement, sont les diamants et les perles.', author: 'Jean de la Bruyère, Les Caractères' },
  { text: 'Coincidence is God\'s way of remaining anonymous.', author: 'Albert Einstein' },
  { text: 'When luck is on your side, it is not the time to be modest.', author: 'José Saramago' },
  { text: 'Not all those who wander are lost.', author: 'J.R.R. Tolkien, The Lord of the Rings' },
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

  // Pull real tickets — one row per ticket, ordered by ticket_number
  const { data: tickets } = await supabase
    .from('tickets')
    .select('ticket_number, user_id')
    .eq('drop_id', drop_id)
    .order('ticket_number', { ascending: true })

  if (!tickets || tickets.length === 0) {
    return NextResponse.json({ error: 'No tickets found for this drop' }, { status: 400 })
  }

  const totalTickets = tickets.length
  const winningIndex = randomInt(0, totalTickets)
  const winningTicketRow = tickets[winningIndex]
  const winnerId = winningTicketRow.user_id
  const winningTicketNumber = winningTicketRow.ticket_number

  // Hash: drop_id + all ticket numbers in order + winning ticket number
  const ticketNumbersCsv = tickets.map(t => t.ticket_number).join(',')
  const hashInput = `${drop_id}|${ticketNumbersCsv}|${winningTicketNumber}`
  const verificationHash = createHash('sha256').update(hashInput).digest('hex')

  const drawInputs = {
    drop_id,
    total_tickets: totalTickets,
    winning_ticket_number: winningTicketNumber,
    algorithm: 'Node.js crypto.randomInt — cryptographically secure CSPRNG',
    verification_note: 'SHA-256(drop_id + "|" + ticket_numbers_csv + "|" + winning_ticket_number) = verification_hash',
  }

  const { error: winnerError } = await supabase.from('winners').insert({
    drop_id,
    user_id: winnerId,
    total_tickets: totalTickets,
    winning_ticket: winningTicketNumber,
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
    const ticketId = String(winningTicketNumber).padStart(4, '0')
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
              <p style="color:#f5ede0;font-size:14px;margin:0;">Ticket #${ticketId} &mdash; 1 of ${totalTickets} entries</p>
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
        body: `DEDSTOK: You won this week's drop. Ticket #${String(winningTicketNumber).padStart(4, '0')} of ${totalTickets}. Check your email for next steps.`,
      })
    } catch (err) {
      console.error('[admin/draw] Winner SMS failed:', err)
    }
  }

  return NextResponse.json({
    success: true,
    winner_id: winnerId,
    winner_email: winnerUser?.email,
    winning_ticket: winningTicketNumber,
    total_tickets: totalTickets,
    verification_hash: verificationHash,
  })
}
