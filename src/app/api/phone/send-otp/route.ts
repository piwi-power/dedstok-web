export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendOtp, getClientIp } from '@/lib/otp'

// E.164 format validator — e.g. +96170123456
const E164_RE = /^\+[1-9]\d{6,14}$/

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
  }

  const { phone } = await request.json()

  if (!phone || !E164_RE.test(phone)) {
    return NextResponse.json(
      { success: false, error: 'Phone must be in E.164 format (e.g. +96170123456)' },
      { status: 400 }
    )
  }

  const service = createServiceClient()

  // Check if phone is already taken by another account
  const { data: existing } = await service
    .from('users')
    .select('id')
    .eq('phone', phone)
    .neq('id', user.id)
    .single()

  if (existing) {
    return NextResponse.json(
      { success: false, error: 'This number is linked to another account' },
      { status: 409 }
    )
  }

  const sent = await sendOtp(service, phone, getClientIp(request), 'send-otp')
  if (!sent.ok) {
    return NextResponse.json({ success: false, error: sent.error }, { status: sent.status })
  }

  return NextResponse.json({ success: true })
}
