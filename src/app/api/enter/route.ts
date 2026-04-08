export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
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

    const body = await request.json()
    const { drop_id, spots_count, influencer_code } = body

    // Validate spots_count — hard cap at 2
    if (!spots_count || spots_count < 1 || spots_count > 2) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Spots must be 1 or 2' },
        { status: 400 }
      )
    }

    // Fetch drop from Supabase
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
    if (drop.spots_sold + spots_count > drop.total_spots) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Not enough spots remaining' },
        { status: 409 }
      )
    }

    // Enforce 2-spot cap: check how many this user already holds for this drop
    const { count: existingSpots } = await supabase
      .from('entries')
      .select('spots_count', { count: 'exact' })
      .eq('drop_id', drop_id)
      .eq('user_id', user.id)

    const alreadyHeld = existingSpots ?? 0
    if (alreadyHeld + spots_count > 2) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Maximum 2 spots per person per drop' },
        { status: 409 }
      )
    }

    // Validate influencer code if provided
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

    const totalAmount = drop.entry_price * spots_count

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(drop.entry_price * 100),
            product_data: {
              name: `${drop.item_name} — ${spots_count} spot${spots_count > 1 ? 's' : ''}`,
              description: `DEDSTOK raffle entry. Draw: ${new Date(drop.draw_date).toDateString()}`,
            },
          },
          quantity: spots_count,
        },
      ],
      metadata: {
        drop_id,
        user_id: user.id,
        spots_count: String(spots_count),
        influencer_code: validCode?.code ?? '',
        total_amount: String(totalAmount),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/enter/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/drops/${drop.slug}`,
    })

    return NextResponse.json<ApiResponse<EntryCheckoutResponse>>({
      success: true,
      data: {
        checkout_url: session.url!,
        session_id: session.id,
      },
    })
  } catch (err) {
    console.error('[/api/enter]', err)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
