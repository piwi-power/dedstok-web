import { randomInt } from 'crypto'
import type { NextRequest } from 'next/server'
import type { createServiceClient } from '@/lib/supabase/server'
import { getTwilio, TWILIO_FROM } from '@/lib/twilio/client'

type ServiceClient = ReturnType<typeof createServiceClient>

type Failure = { ok: false; status: number; error: string }

const OTP_TTL_MS = 10 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000
const HOUR_MS = 60 * 60 * 1000
const MAX_SENDS_PER_PHONE_PER_HOUR = 5
const MAX_SENDS_PER_IP_PER_HOUR = 10
const MAX_VERIFY_ATTEMPTS = 5

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export function maskPhone(phone: string): string {
  return phone.slice(0, -4).replace(/\d/g, '*') + phone.slice(-4)
}

// Generate, store and text a 6-digit code, enforcing per-phone and per-IP limits
export async function sendOtp(
  service: ServiceClient,
  phone: string,
  ip: string,
  logTag: string
): Promise<{ ok: true } | Failure> {
  const hourAgo = new Date(Date.now() - HOUR_MS).toISOString()

  const [{ data: recentForPhone }, { count: recentForIp }] = await Promise.all([
    service
      .from('phone_otps')
      .select('created_at')
      .eq('phone', phone)
      .gte('created_at', hourAgo)
      .order('created_at', { ascending: false }),
    service
      .from('phone_otps')
      .select('id', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', hourAgo),
  ])

  const last = recentForPhone?.[0]?.created_at
  if (last && Date.now() - new Date(last).getTime() < RESEND_COOLDOWN_MS) {
    return { ok: false, status: 429, error: 'Wait a minute before requesting another code' }
  }
  if ((recentForPhone?.length ?? 0) >= MAX_SENDS_PER_PHONE_PER_HOUR) {
    return { ok: false, status: 429, error: 'Too many codes requested for this number. Try again in an hour.' }
  }
  if ((recentForIp ?? 0) >= MAX_SENDS_PER_IP_PER_HOUR) {
    return { ok: false, status: 429, error: 'Too many codes requested. Try again later.' }
  }

  // Invalidate previous unused codes for this phone
  await service.from('phone_otps').update({ used: true }).eq('phone', phone).eq('used', false)

  const code = String(randomInt(100000, 1000000))
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString()
  await service.from('phone_otps').insert({ phone, code, expires_at: expiresAt, ip })

  try {
    await getTwilio().messages.create({
      from: TWILIO_FROM,
      to: phone,
      body: `Your DEDSTOK code is ${code}. Valid for 10 minutes.`,
    })
  } catch (err) {
    console.error(`[${logTag}] Twilio error:`, err)
    return { ok: false, status: 500, error: 'Failed to send SMS' }
  }

  return { ok: true }
}

// Check a code against the latest active one for this phone. Every check counts
// as an attempt; after MAX_VERIFY_ATTEMPTS the code is burned. Caller marks it used on success.
export async function verifyOtp(
  service: ServiceClient,
  phone: string,
  code: string
): Promise<{ ok: true; otpId: string } | Failure> {
  const { data: otp } = await service
    .from('phone_otps')
    .select('id, code, expires_at')
    .eq('phone', phone)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!otp) {
    return { ok: false, status: 400, error: 'No active code. Request a new one.' }
  }
  if (new Date(otp.expires_at) < new Date()) {
    return { ok: false, status: 400, error: 'Code expired. Request a new one.' }
  }

  const { data: attempts, error } = await service.rpc('register_otp_attempt', {
    p_otp_id: otp.id,
    p_max: MAX_VERIFY_ATTEMPTS,
  })
  if (error || typeof attempts !== 'number' || attempts > MAX_VERIFY_ATTEMPTS) {
    return { ok: false, status: 429, error: 'Too many incorrect attempts. Request a new code.' }
  }

  if (otp.code !== code) {
    if (attempts >= MAX_VERIFY_ATTEMPTS) {
      return { ok: false, status: 429, error: 'Too many incorrect attempts. Request a new code.' }
    }
    return { ok: false, status: 400, error: 'Incorrect code. Try again.' }
  }

  return { ok: true, otpId: otp.id }
}
