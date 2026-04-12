export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'
import { getResend, FROM_EMAIL } from '@/lib/resend/client'
import type { ApiResponse, EntryCheckoutResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const service = createServiceClient()

    // Require phone verification
    const { data: userRecord } = await service
      .from('users')
      .select('phone_verified, points_balance, email')
      .eq('id', user.id)
      .single()

    if (!userRecord?.phone_verified) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Phone verification required before entering a drop' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { drop_id, spots_count, points_spots = 0, influencer_code } = body

    const cashSpots = spots_count - points_spots
    const totalSpots = spots_count

    if (totalSpots < 1 || totalSpots > 2 || cashSpots < 0 || points_spots < 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid spot selection' },
        { status: 400 }
      )
    }

    // Fetch drop
    const { data: drop, error: dropError } = await supabase
      .from('drops')
      .select('*')
      .eq('id', drop_id)
      .eq('status', 'active')
      .single()

    if (dropError || !drop) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Drop not found or not active' },
        { status: 404 }
      )
    }

    // Check spots remaining
    if (drop.spots_sold + totalSpots > drop.total_spots) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Not enough spots remaining' },
        { status: 409 }
      )
    }

    // Enforce 2-spot cap
    const { data: existingEntries } = await supabase
      .from('entries')
      .select('spots_count')
      .eq('drop_id', drop_id)
      .eq('user_id', user.id)

    const alreadyHeld = existingEntries?.reduce((sum, e) => sum + e.spots_count, 0) ?? 0
    if (alreadyHeld + totalSpots > 2) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Maximum 2 spots per person per drop' },
        { status: 409 }
      )
    }

    // Validate points if redeeming
    if (points_spots > 0) {
      const pointCost = points_spots * drop.entry_price * 5
      if ((userRecord.points_balance ?? 0) < pointCost) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: `Not enough STOK points. Need ${pointCost}, have ${userRecord.points_balance ?? 0}` },
          { status: 409 }
        )
      }
    }

    // Validate influencer code
    let validCode = null
    if (influencer_code) {
      const { data: code } = await supabase
        .from('influencer_codes')
        .select('*')
        .eq('code', influencer_code.toUpperCase())
        .eq('is_active', true)
        .single()
      validCode = code ?? null
    }

    // Points-only flow (no Stripe needed)
    if (cashSpots === 0) {
      const pointCost = points_spots * drop.entry_price * 5

      const { error: entryError } = await service.from('entries').insert({
        drop_id,
        user_id: user.id,
        spots_count: totalSpots,
        cash_spots: 0,
        points_spots: totalSpots,
        total_paid: 0,
        influencer_code: validCode?.code ?? null,
      })

      if (entryError) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Failed to create entry' },
          { status: 500 }
        )
      }

      await service.rpc('increment_spots_sold', { drop_id, amount: totalSpots })
      await service.rpc('redeem_points', { p_user_id: user.id, p_amount: pointCost, p_drop_id: drop_id })

      if (influencer_code && validCode) {
        await service.rpc('credit_influencer', { code: validCode.code, tickets: totalSpots })
      }

      // Send confirmation email
      if (userRecord.email) {
        try {
          await getResend().emails.send({
            from: FROM_EMAIL,
            to: userRecord.email,
            subject: `You're in — DEDSTOK`,
            html: `
              <div style="background:#0c0a09;color:#f5ede0;font-family:sans-serif;padding:40px;max-width:500px;margin:0 auto;">
                <h1 style="color:#CA8A04;font-size:28px;margin-bottom:8px;">DEDSTOK</h1>
                <p style="color:rgba(245,237,224,0.55);font-size:12px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:32px;">Entry Confirmed</p>
                <p style="color:rgba(245,237,224,0.7);margin-bottom:8px;">Spots: <strong style="color:#f5ede0;">${totalSpots}</strong></p>
                <p style="color:rgba(245,237,224,0.7);margin-bottom:8px;">Paid with: <strong style="color:#CA8A04;">${pointCost} STOK points</strong></p>
                <p style="color:rgba(245,237,224,0.4);font-size:11px;margin-top:32px;">One drop. One winner. Every week.</p>
              </div>
            `,
          })
        } catch {}
      }

      return NextResponse.json<ApiResponse<EntryCheckoutResponse>>({
        success: true,
        data: { checkout_url: `${process.env.NEXT_PUBLIC_SITE_URL}/enter/success?points=1`, session_id: '' },
      })
    }

    // Cash or mixed flow — Stripe checkout for cash spots only
    const cashTotal = drop.entry_price * cashSpots

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(drop.entry_price * 100),
            product_data: {
              name: `${drop.item_name} — ${cashSpots} spot${cashSpots > 1 ? 's' : ''}${points_spots > 0 ? ` + ${points_spots} with points` : ''}`,
              description: `DEDSTOK raffle entry. Draw: ${new Date(drop.draw_date).toDateString()}`,
            },
          },
          quantity: cashSpots,
        },
      ],
      metadata: {
        drop_id,
        user_id: user.id,
        spots_count: String(cashSpots),
        points_spots: String(points_spots),
        influencer_code: validCode?.code ?? '',
        total_amount: String(cashTotal),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/enter/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/drops/${drop.slug}`,
    })

    return NextResponse.json<ApiResponse<EntryCheckoutResponse>>({
      success: true,
      data: { checkout_url: session.url!, session_id: session.id },
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[/api/enter]', message)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
