export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getTwilio, TWILIO_FROM } from '@/lib/twilio/client'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (!session || session !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { winner_id } = await request.json()
  if (!winner_id) return NextResponse.json({ error: 'winner_id required' }, { status: 400 })

  const supabase = createServiceClient()

  const { data: winner } = await supabase
    .from('winners')
    .select('winning_ticket, total_tickets, users(email, phone)')
    .eq('id', winner_id)
    .single()

  if (!winner) return NextResponse.json({ error: 'Winner not found' }, { status: 404 })

  const winnerUser = winner.users as unknown as { email: string; phone: string } | null

  if (!winnerUser?.phone) {
    return NextResponse.json({ error: 'No phone number on record for this winner' }, { status: 400 })
  }

  try {
    await getTwilio().messages.create({
      from: TWILIO_FROM,
      to: winnerUser.phone,
      body: `DEDSTOK: You won this week's drop. Ticket ${(winner.winning_ticket as number) + 1} of ${winner.total_tickets}. Check your email for next steps.`,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[resend-winner-sms]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
