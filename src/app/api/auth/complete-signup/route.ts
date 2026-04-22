export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const E164_RE = /^\+[1-9]\d{6,14}$/
const USERNAME_RE = /^[a-z0-9_]{3,20}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  const { email, username, phone, password, code, referralCode } = await request.json()

  // ── Validate inputs ───────────────────────────────────────────────────────────
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 })
  }
  if (!username || !USERNAME_RE.test(username)) {
    return NextResponse.json({ success: false, error: 'Invalid username' }, { status: 400 })
  }
  if (!phone || !E164_RE.test(phone)) {
    return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 })
  }
  if (!password || password.length < 6 || password.length > 20) {
    return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 400 })
  }
  if (!code || code.length !== 6) {
    return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 400 })
  }

  const service = createServiceClient()

  // ── Verify OTP ────────────────────────────────────────────────────────────────
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

  // ── Check uniqueness ──────────────────────────────────────────────────────────
  const [{ data: emailExists }, { data: usernameExists }, { data: phoneExists }] = await Promise.all([
    service.from('users').select('id').eq('email', email).maybeSingle(),
    service.from('users').select('id').eq('username', username).maybeSingle(),
    service.from('users').select('id').eq('phone', phone).eq('phone_verified', true).maybeSingle(),
  ])

  if (emailExists) {
    return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 409 })
  }
  if (usernameExists) {
    return NextResponse.json({ success: false, error: 'This username is taken' }, { status: 409 })
  }
  if (phoneExists) {
    return NextResponse.json({ success: false, error: 'This number is linked to another account' }, { status: 409 })
  }

  // ── Create Supabase auth user ─────────────────────────────────────────────────
  // admin.createUser bypasses email confirmation — phone OTP is our verification gate
  const { data: authData, error: authError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    console.error('[complete-signup] createUser error:', authError)
    return NextResponse.json(
      { success: false, error: authError?.message ?? 'Failed to create account' },
      { status: 500 }
    )
  }

  const userId = authData.user.id
  const ownReferralCode = userId.replace(/-/g, '').slice(0, 8).toLowerCase()

  // ── Resolve referrer (permanent — not settable after signup) ──────────────────
  let referrerId: string | null = null
  if (referralCode && typeof referralCode === 'string') {
    const { data: referrer } = await service
      .from('users')
      .select('id')
      .eq('referral_code', referralCode.toLowerCase())
      .neq('id', userId)
      .maybeSingle()
    referrerId = referrer?.id ?? null
  }

  // ── Mark OTP used ─────────────────────────────────────────────────────────────
  await service.from('phone_otps').update({ used: true }).eq('id', otp.id)

  // ── Update profile with all signup data ───────────────────────────────────────
  // The handle_new_user trigger created the row; we now fill in the rest.
  await service.from('users').upsert(
    {
      id: userId,
      email,
      username: username.toLowerCase(),
      phone,
      phone_verified: true,
      auth_provider: 'email',
      referral_code: ownReferralCode,
      ...(referrerId ? { referrer_id: referrerId } : {}),
    },
    { onConflict: 'id' }
  )

  return NextResponse.json({ success: true, email })
}
