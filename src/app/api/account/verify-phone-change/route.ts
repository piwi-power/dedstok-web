export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

const E164_RE = /^\+[1-9]\d{6,14}$/

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }

  const { phone, code } = await request.json()

  if (!phone || !E164_RE.test(phone)) {
    return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 })
  }
  if (!code || code.length !== 6) {
    return NextResponse.json({ success: false, error: 'Invalid code' }, { status: 400 })
  }

  const service = createServiceClient()

  const { data: otp } = await service
    .from('phone_otps')
    .select('id, expires_at')
    .eq('phone', phone)
    .eq('code', code)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!otp) {
    return NextResponse.json({ success: false, error: 'Incorrect code. Try again.' }, { status: 400 })
  }
  if (new Date(otp.expires_at) < new Date()) {
    return NextResponse.json({ success: false, error: 'Code expired. Request a new one.' }, { status: 400 })
  }

  await service.from('phone_otps').update({ used: true }).eq('id', otp.id)

  const { error } = await service
    .from('users')
    .update({ phone, phone_verified: true })
    .eq('id', user.id)

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ success: false, error: 'This number is linked to another account' }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: 'Failed to update phone' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
