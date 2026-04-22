export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

const E164_RE = /^\+[1-9]\d{6,14}$/
const USERNAME_RE = /^[a-z0-9_]{3,20}$/

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }

  const { username, phone, code } = await request.json()

  if (!username || !USERNAME_RE.test(username)) {
    return NextResponse.json({ success: false, error: 'Invalid username' }, { status: 400 })
  }
  if (!phone || !E164_RE.test(phone)) {
    return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 })
  }
  if (!code || code.length !== 6) {
    return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 400 })
  }

  const service = createServiceClient()

  // Verify OTP
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

  // Check username not taken
  const { data: usernameTaken } = await service
    .from('users')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .maybeSingle()

  if (usernameTaken) {
    return NextResponse.json({ success: false, error: 'Username is taken' }, { status: 409 })
  }

  // Check phone not taken
  const { data: phoneTaken } = await service
    .from('users')
    .select('id')
    .eq('phone', phone)
    .eq('phone_verified', true)
    .neq('id', user.id)
    .maybeSingle()

  if (phoneTaken) {
    return NextResponse.json({ success: false, error: 'This number is linked to another account' }, { status: 409 })
  }

  // Mark OTP used + update profile
  await service.from('phone_otps').update({ used: true }).eq('id', otp.id)

  await service.from('users').update({
    username: username.toLowerCase(),
    phone,
    phone_verified: true,
  }).eq('id', user.id)

  return NextResponse.json({ success: true })
}
