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
    const { name, instagram, commission_rate = 0.10 } = payload
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

    const code = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)

    const { data, error } = await supabase
      .from('influencer_codes')
      .insert({
        code,
        influencer_name: name,
        instagram_handle: instagram ?? null,
        commission_rate: parseFloat(commission_rate),
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

  if (action === 'mark_paid') {
    const { code } = payload
    const { error } = await supabase.rpc('mark_influencer_paid', { p_code: code })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'delete') {
    // Soft delete: deactivate + stamp deleted_at, preserves earnings history for the influencer
    const { code } = payload
    const { error } = await supabase
      .from('influencer_codes')
      .update({ is_active: false, deleted_at: new Date().toISOString() })
      .eq('code', code)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'link_user') {
    // Link an influencer's DEDSTOK account to their code so they can see earnings
    const { code, email } = payload
    if (!code || !email) return NextResponse.json({ error: 'code and email required' }, { status: 400 })

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'No account found for that email' }, { status: 404 })
    }

    const { error } = await supabase
      .from('influencer_codes')
      .update({ user_id: userData.id })
      .eq('code', code)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
