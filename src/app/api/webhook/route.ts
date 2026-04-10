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

async function sendConfirmationEmail(
  customerEmail: string,
  spotsNum: number,
  pointsEarned: number
) {
  const { data: emailData, error: emailError } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `You're in — DEDSTOK`,
    html: buildEmailHtml(spotsNum, pointsEarned),
  })
  if (emailError) {
    console.error('[webhook] Resend error:', emailError)
  } else {
    console.log('[webhook] Email sent:', emailData?.id)
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
  const { drop_id, user_id, spots_count, influencer_code, total_amount } =
    session.metadata ?? {}

  if (!drop_id || !user_id || !spots_count) {
    console.error('[webhook] Missing metadata', session.metadata)
    return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const spotsNum = parseInt(spots_count)
  const totalPaid = parseFloat(total_amount)
  const paymentIntent = session.payment_intent as string
  const customerEmail = session.customer_details?.email ?? null
  const pointsEarned = Math.floor(totalPaid)

  // 0. Idempotency — if this payment was already processed, just resend the email
  const { data: existingEntry } = await supabase
    .from('entries')
    .select('id')
    .eq('stripe_payment_id', paymentIntent)
    .single()

  if (existingEntry) {
    console.log('[webhook] Already processed, skipping to email')
    if (customerEmail) {
      try {
        await sendConfirmationEmail(customerEmail, spotsNum, pointsEarned)
      } catch (err) {
        console.error('[webhook] Email exception (retry):', err)
      }
    }
    return NextResponse.json({ received: true })
  }

  // 1. Ensure user row exists
  await supabase.from('users').upsert(
    { id: user_id, email: customerEmail ?? '' },
    { onConflict: 'id', ignoreDuplicates: true }
  )

  // 2. Write entry to Supabase
  const { error: entryError } = await supabase.from('entries').insert({
    drop_id,
    user_id,
    spots_count: spotsNum,
    total_paid: totalPaid,
    stripe_payment_id: paymentIntent,
    influencer_code: influencer_code || null,
  })

  if (entryError) {
    console.error('[webhook] Entry insert failed', entryError)
    return NextResponse.json({ error: 'Entry insert failed' }, { status: 500 })
  }

  // 3. Increment spots_sold on the drop
  await supabase.rpc('increment_spots_sold', { drop_id, amount: spotsNum })

  // 4. Credit points to user (1 point per $1 spent)
  await supabase.rpc('add_points', { user_id, amount: pointsEarned, drop_id })

  // 5. Credit influencer commission if code was used
  if (influencer_code) {
    await supabase.rpc('credit_influencer', {
      code: influencer_code,
      tickets: spotsNum,
    })
  }

  // 6. Send confirmation email
  console.log('[webhook] Sending email to:', customerEmail)

  if (customerEmail) {
    try {
      await sendConfirmationEmail(customerEmail, spotsNum, pointsEarned)
    } catch (err) {
      console.error('[webhook] Email exception:', err)
    }
  } else {
    console.warn('[webhook] No customer email found in session')
  }

  return NextResponse.json({ received: true })
}
