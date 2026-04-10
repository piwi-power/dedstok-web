export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getTwilio, TWILIO_FROM } from '@/lib/twilio/client'

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

  // Invalidate any previous unused OTPs for this phone
  await service
    .from('phone_otps')
    .update({ used: true })
    .eq('phone', phone)
    .eq('used', false)

  // Generate 6-digit code
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min

  await service.from('phone_otps').insert({ phone, code, expires_at: expiresAt })

  // Send via Twilio
  try {
    await getTwilio().messages.create({
      from: TWILIO_FROM,
      to: phone,
      body: `Your DEDSTOK verification code is ${code}. Valid for 10 minutes.`,
    })
  } catch (err) {
    console.error('[send-otp] Twilio error:', err)
    return NextResponse.json({ success: false, error: 'Failed to send SMS' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
