export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { createServiceClient } from '@/lib/supabase/server'
import { getResend, FROM_EMAIL } from '@/lib/resend/client'
import Stripe from 'stripe'

// Stripe requires the raw body for webhook signature verification
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[webhook] Invalid signature', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const { drop_id, user_id, spots_count, influencer_code, total_amount } =
    session.metadata ?? {}

  if (!drop_id || !user_id || !spots_count) {
    console.error('[webhook] Missing metadata', session.metadata)
    return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const spotsNum = parseInt(spots_count)
  const totalPaid = parseFloat(total_amount)

  // 0. Ensure user row exists (handles users who signed up before migration)
  await supabase.from('users').upsert(
    { id: user_id, email: session.customer_details?.email ?? '' },
    { onConflict: 'id', ignoreDuplicates: true }
  )

  // 1. Write entry to Supabase
  const { error: entryError } = await supabase.from('entries').insert({
    drop_id,
    user_id,
    spots_count: spotsNum,
    total_paid: totalPaid,
    stripe_payment_id: session.payment_intent as string,
    influencer_code: influencer_code || null,
  })

  if (entryError) {
    console.error('[webhook] Entry insert failed', entryError)
    return NextResponse.json({ error: 'Entry insert failed' }, { status: 500 })
  }

  // 2. Increment spots_sold on the drop
  await supabase.rpc('increment_spots_sold', { drop_id, amount: spotsNum })

  // 3. Credit points to user (1 point per $1 spent)
  const pointsEarned = Math.floor(totalPaid)
  await supabase.rpc('add_points', { user_id, amount: pointsEarned, drop_id })

  // 4. Credit influencer commission if code was used
  if (influencer_code) {
    await supabase.rpc('credit_influencer', {
      code: influencer_code,
      tickets: spotsNum,
    })
  }

  // 5. Send confirmation email via Resend
  const { data: drop } = await supabase
    .from('drops')
    .select('item_name, draw_date, total_spots, entry_price')
    .eq('id', drop_id)
    .single()

  const { data: userProfile } = await supabase
    .from('users')
    .select('email')
    .eq('id', user_id)
    .single()

  if (drop && userProfile) {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: userProfile.email,
      subject: `You're in — ${drop.item_name}`,
      html: `
        <div style="background:#0c0a09;color:#f5ede0;font-family:sans-serif;padding:40px;max-width:500px;margin:0 auto;">
          <h1 style="color:#CA8A04;font-size:28px;margin-bottom:8px;">DEDSTOK</h1>
          <p style="color:rgba(245,237,224,0.55);font-size:12px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:32px;">
            Entry Confirmed
          </p>
          <h2 style="font-size:22px;margin-bottom:16px;">${drop.item_name}</h2>
          <p style="color:rgba(245,237,224,0.7);margin-bottom:8px;">
            Spots purchased: <strong style="color:#f5ede0;">${spotsNum}</strong>
          </p>
          <p style="color:rgba(245,237,224,0.7);margin-bottom:8px;">
            Odds: <strong style="color:#f5ede0;">1 in ${drop.total_spots}</strong> per spot
          </p>
          <p style="color:rgba(245,237,224,0.7);margin-bottom:8px;">
            Points earned: <strong style="color:#CA8A04;">+${pointsEarned} STOK</strong>
          </p>
          <p style="color:rgba(245,237,224,0.7);margin-bottom:32px;">
            Draw: <strong style="color:#f5ede0;">${new Date(drop.draw_date).toDateString()}</strong>
          </p>
          <p style="color:rgba(245,237,224,0.4);font-size:11px;">
            One drop. One winner. Every week.
          </p>
        </div>
      `,
    })
  }

  return NextResponse.json({ received: true })
}
