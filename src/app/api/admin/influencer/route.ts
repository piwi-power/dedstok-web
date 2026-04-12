export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (!session || session !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { action, ...payload } = await request.json()
  const supabase = createServiceClient()

  if (action === 'create') {
    const { name, instagram, commission } = payload
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

    // Generate code from name
    const code = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)

    const { data, error } = await supabase
      .from('influencer_codes')
      .insert({
        code,
        influencer_name: name,
        instagram_handle: instagram ?? null,
        commission_per_ticket: parseFloat(commission ?? '1'),
        is_active: true,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  }

  if (action === 'toggle') {
    const { id, is_active } = payload
    const { error } = await supabase
      .from('influencer_codes')
      .update({ is_active })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
