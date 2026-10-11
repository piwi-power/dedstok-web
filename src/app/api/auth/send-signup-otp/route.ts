export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendOtp, getClientIp, maskPhone } from '@/lib/otp'

const E164_RE = /^\+[1-9]\d{6,14}$/

export async function POST(request: NextRequest) {
  const { phone } = await request.json()

  if (!phone || !E164_RE.test(phone)) {
    return NextResponse.json(
      { success: false, error: 'Phone must be in E.164 format (e.g. +96170123456)' },
      { status: 400 }
    )
  }

  const service = createServiceClient()

  // Reject if this phone is already verified on an account
  const { data: existing } = await service
    .from('users')
    .select('id')
    .eq('phone', phone)
    .eq('phone_verified', true)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { success: false, error: 'This number is linked to another account' },
      { status: 409 }
    )
  }

  const sent = await sendOtp(service, phone, getClientIp(request), 'send-signup-otp')
  if (!sent.ok) {
    return NextResponse.json({ success: false, error: sent.error }, { status: sent.status })
  }

  return NextResponse.json({ success: true, maskedPhone: maskPhone(phone) })
}
