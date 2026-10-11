export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyOtp } from '@/lib/otp'

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

  const otp = await verifyOtp(service, phone, String(code))
  if (!otp.ok) {
    return NextResponse.json({ success: false, error: otp.error }, { status: otp.status })
  }

  // Mark OTP used
  await service.from('phone_otps').update({ used: true }).eq('id', otp.otpId)

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
