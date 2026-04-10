export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
  }

  const { phone, code } = await request.json()

  if (!phone || !code) {
    return NextResponse.json({ success: false, error: 'Phone and code required' }, { status: 400 })
  }

  const service = createServiceClient()

  // Find valid OTP
  const { data: otp } = await service
    .from('phone_otps')
    .select('id, expires_at')
    .eq('phone', phone)
    .eq('code', code)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!otp) {
    return NextResponse.json({ success: false, error: 'Invalid code' }, { status: 400 })
  }

  if (new Date(otp.expires_at) < new Date()) {
    return NextResponse.json({ success: false, error: 'Code expired' }, { status: 400 })
  }

  // Mark OTP used
  await service.from('phone_otps').update({ used: true }).eq('id', otp.id)

  // Update user record
  const { error } = await service
    .from('users')
    .update({ phone, phone_verified: true })
    .eq('id', user.id)

  if (error) {
    // Unique violation means phone was just taken by another account
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'This number is linked to another account' },
        { status: 409 }
      )
    }
    return NextResponse.json({ success: false, error: 'Failed to verify' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
