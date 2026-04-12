export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

async function checkAuth() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  return session === process.env.ADMIN_SECRET
}

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// CREATE drop
export async function POST(request: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { item_name, description, entry_price, total_spots, draw_date, market_value, sourcing_tier, status, image_url } = body

  if (!item_name || !entry_price || !total_spots || !draw_date) {
    return NextResponse.json({ error: 'item_name, entry_price, total_spots and draw_date are required' }, { status: 400 })
  }

  const slug = body.slug?.trim() ? slugify(body.slug) : slugify(item_name)
  const supabase = createServiceClient()

  const { data, error } = await supabase.from('drops').insert({
    item_name,
    slug,
    description: description ?? null,
    entry_price: Number(entry_price),
    total_spots: Number(total_spots),
    draw_date,
    market_value: market_value ? Number(market_value) : null,
    sourcing_tier: sourcing_tier ?? null,
    status: status ?? 'scheduled',
    image_url: image_url?.trim() || null,
    spots_sold: 0,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, drop: data })
}

// UPDATE drop
export async function PATCH(request: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { drop_id, ...fields } = body

  if (!drop_id) return NextResponse.json({ error: 'drop_id required' }, { status: 400 })

  const allowed = ['item_name', 'slug', 'description', 'entry_price', 'total_spots', 'draw_date', 'market_value', 'sourcing_tier', 'status', 'image_url']
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (fields[key] !== undefined) update[key] = fields[key]
  }
  if (fields.item_name && !fields.slug) update.slug = slugify(fields.item_name)
  if (fields.entry_price) update.entry_price = Number(fields.entry_price)
  if (fields.total_spots) update.total_spots = Number(fields.total_spots)
  if (fields.market_value) update.market_value = Number(fields.market_value)

  const supabase = createServiceClient()
  const { error } = await supabase.from('drops').update(update).eq('id', drop_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE drop
export async function DELETE(request: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { drop_id } = await request.json()
  if (!drop_id) return NextResponse.json({ error: 'drop_id required' }, { status: 400 })

  const supabase = createServiceClient()

  // Block deletion if a winner has been drawn
  const { data: winner } = await supabase.from('winners').select('id').eq('drop_id', drop_id).single()
  if (winner) return NextResponse.json({ error: 'Cannot delete a drop that has a drawn winner.' }, { status: 400 })

  const { error } = await supabase.from('drops').delete().eq('id', drop_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
