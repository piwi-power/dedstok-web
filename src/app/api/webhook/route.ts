export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { createServiceClient } from '@/lib/supabase/server'
import { getResend, FROM_EMAIL } from '@/lib/resend/client'
import Stripe from 'stripe'

export const runtime = 'nodejs'

function buildEmailHtml(spotsNum: number, pointsEarned: number): string {
  return `
    <div style="background:#0c0a09;color:#f5ede0;font-family:sans-serif;padding:40px;max-width:500px;margin:0 auto;">
      <h1 style="color:#CA8A04;font-size:28px;margin-bottom:8px;">DEDSTOK</h1>
      <p style="color:rgba(245,237,224,0.55);font-size:12px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:32px;">
        Entry Confirmed
      </p>
      <p style="color:rgba(245,237,224,0.7);margin-bottom:8px;">
        Spots purchased: <strong style="color:#f5ede0;">${spotsNum}</strong>
      </p>
      <p style="color:rgba(245,237,224,0.7);margin-bottom:8px;">
        Points earned: <strong style="color:#CA8A04;">+${pointsEarned} STOK</strong>
      </p>
      <p style="color:rgba(245,237,224,0.4);font-size:11px;margin-top:32px;">
        One drop. One winner. Every week.
      </p>
    </div>
  `
}

async function sendConfirmationEmail(customerEmail: string, spotsNum: number, pointsEarned: number) {
  const { data: emailData, error: emailError } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `You're in — DEDSTOK`,
    html: buildEmailHtml(spotsNum, pointsEarned),
  })
  if (emailError) console.error('[webhook] Resend error:', emailError)
  else console.log('[webhook] Email sent:', emailData?.id)
}

async function handleReferral(supabase: ReturnType<typeof createServiceClient>, user_id: string, pointsEarned: number) {
  // Get user's referrer
  const { data: user } = await supabase
    .from('users')
    .select('referrer_id, first_referral_credited')
    .eq('id', user_id)
    .single()

  if (!user?.referrer_id) return

  // Always credit 50% of buyer's earned points to their referrer, forever
  const bonus = Math.floor(pointsEarned * 0.5)
  if (bonus > 0) {
    await supabase.rpc('credit_referrer', {
      referrer_id: user.referrer_id,
      amount: bonus,
      source_user_id: user_id,
    })
  }

  // Increment total_referrals counter only on first purchase
  if (!user.first_referral_credited) {
    await supabase
      .from('users')
      .update({ first_referral_credited: true })
      .eq('id', user_id)
    await supabase.rpc('increment_total_referrals', { p_user_id: user.referrer_id })
  }
}

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
  const { drop_id, user_id, spots_count, influencer_code, total_amount, points_spots, entry_price } =
    session.metadata ?? {}

  if (!drop_id || !user_id || !spots_count) {
    console.error('[webhook] Missing metadata', session.metadata)
    return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const cashSpots = parseInt(spots_count)
  const pointsSpots = parseInt(points_spots ?? '0')
  const totalSpots = cashSpots + pointsSpots
  const totalPaid = parseFloat(total_amount)
  const entryPriceNum = parseFloat(entry_price ?? '0')
  const paymentIntent = session.payment_intent as string
  const customerEmail = session.customer_details?.email ?? null
  const pointsEarned = Math.floor(totalPaid) // points only on cash paid amount

  // 0. Idempotency
  const { data: existingEntry } = await supabase
    .from('entries')
    .select('id')
    .eq('stripe_payment_id', paymentIntent)
    .single()

  if (existingEntry) {
    console.log('[webhook] Already processed, skipping to email')
    if (customerEmail) {
      try { await sendConfirmationEmail(customerEmail, totalSpots, pointsEarned) } catch {}
    }
    return NextResponse.json({ received: true })
  }

  // 1. Ensure user row exists
  await supabase.from('users').upsert(
    { id: user_id, email: customerEmail ?? '' },
    { onConflict: 'id', ignoreDuplicates: true }
  )

  // 2. Write entry — upsert so buying in two separate transactions works correctly
  const { data: userDropEntry } = await supabase.from('entries')
    .select('id, spots_count, cash_spots, points_spots, total_paid')
    .eq('drop_id', drop_id)
    .eq('user_id', user_id)
    .single()

  let entryError
  if (userDropEntry) {
    const { error } = await supabase.from('entries')
      .update({
        spots_count: userDropEntry.spots_count + totalSpots,
        cash_spots: (userDropEntry.cash_spots ?? 0) + cashSpots,
        points_spots: (userDropEntry.points_spots ?? 0) + pointsSpots,
        total_paid: (userDropEntry.total_paid ?? 0) + totalPaid,
        stripe_payment_id: paymentIntent,
      })
      .eq('id', userDropEntry.id)
    entryError = error
  } else {
    const { error } = await supabase.from('entries').insert({
      drop_id,
      user_id,
      spots_count: totalSpots,
      cash_spots: cashSpots,
      points_spots: pointsSpots,
      total_paid: totalPaid,
      stripe_payment_id: paymentIntent,
      influencer_code: influencer_code || null,
    })
    entryError = error
  }

  if (entryError) {
    console.error('[webhook] Entry upsert failed', entryError)
    return NextResponse.json({ error: 'Entry insert failed' }, { status: 500 })
  }

  // 3. Increment spots_sold + user's total_entries (only on new entry row)
  await supabase.rpc('increment_spots_sold', { drop_id, amount: totalSpots })
  if (!userDropEntry) await supabase.rpc('increment_total_entries', { p_user_id: user_id })

  // 4. Credit earned points (cash spots only)
  if (pointsEarned > 0) {
    await supabase.rpc('add_points', { user_id, amount: pointsEarned, drop_id })
  }

  // 5. Deduct redeemed points (points spots)
  if (pointsSpots > 0) {
    const dropData = await supabase.from('drops').select('entry_price').eq('id', drop_id).single()
    const entryPrice = dropData.data?.entry_price ?? 0
    const pointCost = pointsSpots * entryPrice * 5 // 5:1 rate
    await supabase.rpc('redeem_points', { p_user_id: user_id, p_amount: pointCost, p_drop_id: drop_id })
  }

  // 6. Handle referral crediting
  await handleReferral(supabase, user_id, pointsEarned)

  // 7. Credit influencer commission (10% of entry_price × spots) + 10pt buyer bonus per spot
  if (influencer_code) {
    await supabase.rpc('credit_influencer', {
      p_code: influencer_code,
      p_tickets: totalSpots,
      p_entry_price: entryPriceNum,
    })
    await supabase.rpc('add_points', { user_id, amount: 10 * totalSpots, drop_id })
  }

  // 8. Confirmation email
  if (customerEmail) {
    try { await sendConfirmationEmail(customerEmail, totalSpots, pointsEarned) } catch {}
  }

  return NextResponse.json({ received: true })
}
