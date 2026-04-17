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

  // Entries are the canonical ticket pool — ordered by purchase time, each spot = one ticket
  const { data: entries, error: entriesError } = await supabase
    .from('entries')
    .select('id, user_id, spots_count')
    .eq('drop_id', drop_id)
    .order('created_at', { ascending: true })

  if (entriesError || !entries || entries.length === 0) {
    return NextResponse.json({ error: 'No entries found for this drop' }, { status: 400 })
  }

  // Expand entries into 0-indexed ticket slots
  const ticketSlots: { ticketIndex: number; userId: string }[] = []
  for (const entry of entries) {
    for (let i = 0; i < (entry.spots_count ?? 1); i++) {
      ticketSlots.push({ ticketIndex: ticketSlots.length, userId: entry.user_id })
    }
  }

  const totalTickets = ticketSlots.length
  const winningIndex = randomInt(0, totalTickets)
  const winnerId = ticketSlots[winningIndex].userId
  const entryIdsInOrder = entries.map(e => e.id)

  // Hash: drop_id | entry_ids_csv | winning_ticket_index
  const hashInput = `${drop_id}|${entryIdsInOrder.join(',')}|${winningIndex}`
  const verificationHash = createHash('sha256').update(hashInput).digest('hex')

  const drawInputs = {
    drop_id,
    entry_ids_in_order: entryIdsInOrder,
    total_tickets: totalTickets,
    winning_ticket_index: winningIndex,
    algorithm: 'Node.js crypto.randomInt — cryptographically secure CSPRNG',
    verification_note: 'SHA-256(drop_id + "|" + entry_ids_csv + "|" + winning_ticket_index) = verification_hash',
  }

  const { error: winnerError } = await supabase.from('winners').insert({
    drop_id,
    user_id: winnerId,
    total_tickets: totalTickets,
    winning_ticket: winningIndex,
    verification_hash: verificationHash,
    draw_inputs: drawInputs,
    announced: true,
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
    const ticketId = String(winningIndex + 1).padStart(4, '0')
    const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dedstok-web.vercel.app'}/verify/${drop_id}`
    const quote = pickQuote()

    try {
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: winnerUser.email,
        subject: `You won — DEDSTOK`,
        html: `
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
