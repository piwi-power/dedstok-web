export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendOtp, getClientIp, maskPhone } from '@/lib/otp'

const E164_RE = /^\+[1-9]\d{6,14}$/

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }

  const { phone } = await request.json()

  if (!phone || !E164_RE.test(phone)) {
    return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 })
  }

  const service = createServiceClient()

  // Check not already taken by another account
  const { data: existing } = await service
    .from('users')
    .select('id')
    .eq('phone', phone)
    .eq('phone_verified', true)
    .neq('id', user.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ success: false, error: 'This number is linked to another account' }, { status: 409 })
  }

  const sent = await sendOtp(service, phone, getClientIp(request), 'change-phone')
  if (!sent.ok) {
    return NextResponse.json({ success: false, error: sent.error }, { status: sent.status })
  }

  return NextResponse.json({ success: true, maskedPhone: maskPhone(phone) })
}
