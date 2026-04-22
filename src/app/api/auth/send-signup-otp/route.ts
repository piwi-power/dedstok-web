export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getTwilio, TWILIO_FROM } from '@/lib/twilio/client'

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

  // Invalidate previous unused OTPs for this phone
  await service
    .from('phone_otps')
    .update({ used: true })
    .eq('phone', phone)
    .eq('used', false)

  const code = String(Math.floor(100000 + Math.random() * 900000))
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  await service.from('phone_otps').insert({ phone, code, expires_at: expiresAt })

  try {
    await getTwilio().messages.create({
      from: TWILIO_FROM,
      to: phone,
      body: `Your DEDSTOK code is ${code}. Valid for 10 minutes.`,
    })
  } catch (err) {
    console.error('[send-signup-otp] Twilio error:', err)
    return NextResponse.json({ success: false, error: 'Failed to send SMS' }, { status: 500 })
  }

  // Return masked phone for display
  const masked = phone.slice(0, -4).replace(/\d/g, '*') + phone.slice(-4)
  return NextResponse.json({ success: true, maskedPhone: masked })
}
