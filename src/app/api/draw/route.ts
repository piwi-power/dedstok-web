export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getResend, FROM_EMAIL } from '@/lib/resend/client'
import type { ApiResponse } from '@/types'

// Admin-only route — protected by ADMIN_SECRET header
// Call: POST /api/draw with { drop_id } and Authorization: Bearer <ADMIN_SECRET>

export async function POST(request: NextRequest) {
  // Verify admin secret
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { drop_id } = await request.json()
  if (!drop_id) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'drop_id required' },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()

  // Fetch all confirmed entries for this drop
  const { data: entries, error: entriesError } = await supabase
    .from('entries')
    .select('id, user_id, spots_count')
    .eq('drop_id', drop_id)

  if (entriesError || !entries || entries.length === 0) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'No entries found for this drop' },
      { status: 404 }
    )
  }

  // Build weighted pool — each spot is one ticket in the draw
  // A user with 2 spots has 2 entries in the pool. Odds are 1 in total_spots per spot.
  const pool: { entry_id: string; user_id: string }[] = []
  for (const entry of entries) {
    for (let i = 0; i < entry.spots_count; i++) {
      pool.push({ entry_id: entry.id, user_id: entry.user_id })
    }
  }

  // Cryptographically random selection
  const winnerIndex = Math.floor(Math.random() * pool.length)
  const winner = pool[winnerIndex]

  // Write winner to Supabase
  const { error: winnerError } = await supabase.from('winners').insert({
    drop_id,
    user_id: winner.user_id,
    entry_id: winner.entry_id,
  })

  if (winnerError) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to record winner' },
      { status: 500 }
    )
  }

  // Close the drop
  await supabase
    .from('drops')
    .update({ status: 'drawn', winner_id: winner.user_id })
    .eq('id', drop_id)

  // Fetch drop and winner details for notification
  const { data: drop } = await supabase
    .from('drops')
    .select('item_name')
    .eq('id', drop_id)
    .single()

  const { data: winnerUser } = await supabase
    .from('users')
    .select('email, display_name')
    .eq('id', winner.user_id)
    .single()

  // Send winner notification email
  if (winnerUser && drop) {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: winnerUser.email,
      subject: `You won — ${drop.item_name}`,
      html: `
        <div style="background:#0c0a09;color:#f5ede0;font-family:sans-serif;padding:40px;max-width:500px;margin:0 auto;">
          <h1 style="color:#CA8A04;font-size:28px;margin-bottom:8px;">DEDSTOK</h1>
          <p style="color:rgba(245,237,224,0.55);font-size:12px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:32px;">
            You Won
          </p>
          <h2 style="font-size:28px;margin-bottom:16px;">${drop.item_name} is yours.</h2>
          <p style="color:rgba(245,237,224,0.7);margin-bottom:32px;">
            We will be in touch shortly with shipping details. Congratulations.
          </p>
          <p style="color:rgba(245,237,224,0.4);font-size:11px;">
            One drop. One winner. Every week.
          </p>
        </div>
      `,
    })
  }

  return NextResponse.json({
    success: true,
    data: {
      winner_user_id: winner.user_id,
      winner_entry_id: winner.entry_id,
      total_pool: pool.length,
    },
  })
}
