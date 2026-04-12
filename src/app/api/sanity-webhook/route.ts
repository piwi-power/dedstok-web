export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Sanity sends this webhook every time a drop document is created or updated.
// It upserts the drop into Supabase so the site stays in sync automatically.
// Setup: Sanity Dashboard → API → Webhooks → point to /api/sanity-webhook?secret=SANITY_WEBHOOK_SECRET
// Trigger on: Create, Update — Filter: _type == "drop"

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (!secret || secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Sanity sends the full document on create/update
  const doc = body as {
    _type?: string
    _id?: string
    slug?: { current: string }
    item_name?: string
    entry_price?: number
    total_spots?: number
    draw_date?: string
    status?: string
  }

  if (doc._type !== 'drop') {
    return NextResponse.json({ skipped: true })
  }

  const slug = doc.slug?.current
  const item_name = doc.item_name
  const entry_price = doc.entry_price
  const total_spots = doc.total_spots
  const draw_date = doc.draw_date
  const sanityStatus = doc.status // 'scheduled' | 'active' | 'closed' | 'drawn'

  if (!slug || !item_name || !entry_price || !total_spots || !draw_date) {
    console.error('[sanity-webhook] Missing required fields', doc)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Check if this drop already exists in Supabase
  const { data: existing } = await supabase
    .from('drops')
    .select('id, status')
    .eq('slug', slug)
    .single()

  if (existing) {
    // Never override status if it's already 'drawn' — protects against accidents
    const statusToSet = existing.status === 'drawn' ? 'drawn' : (sanityStatus ?? existing.status)

    const { error } = await supabase
      .from('drops')
      .update({
        item_name,
        entry_price,
        total_spots,
        draw_date,
        status: statusToSet,
      })
      .eq('slug', slug)

    if (error) {
      console.error('[sanity-webhook] Update failed', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[sanity-webhook] Updated drop: ${slug} (status: ${statusToSet})`)
    return NextResponse.json({ synced: 'updated', slug })
  }

  // New drop — insert with spots_sold = 0
  const { error } = await supabase
    .from('drops')
    .insert({
      slug,
      item_name,
      entry_price,
      total_spots,
      draw_date,
      status: sanityStatus ?? 'scheduled',
      spots_sold: 0,
    })

  if (error) {
    console.error('[sanity-webhook] Insert failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log(`[sanity-webhook] Created drop: ${slug} (status: ${sanityStatus ?? 'scheduled'})`)
  return NextResponse.json({ synced: 'created', slug })
}
