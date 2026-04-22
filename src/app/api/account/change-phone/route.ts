export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getTwilio, TWILIO_FROM } from '@/lib/twilio/client'

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

  // Invalidate previous OTPs for this phone
  await service.from('phone_otps').update({ used: true }).eq('phone', phone).eq('used', false)

  const code = String(Math.floor(100000 + Math.random() * 900000))
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  await service.from('phone_otps').insert({ phone, code, expires_at: expiresAt })

  try {
    await getTwilio().messages.create({
      from: TWILIO_FROM,
      to: phone,
      body: `Your DEDSTOK verification code is ${code}. Valid for 10 minutes.`,
    })
  } catch (err) {
    console.error('[change-phone] Twilio error:', err)
    return NextResponse.json({ success: false, error: 'Failed to send SMS' }, { status: 500 })
  }

  const masked = phone.slice(0, -4).replace(/\d/g, '*') + phone.slice(-4)
  return NextResponse.json({ success: true, maskedPhone: masked })
}
