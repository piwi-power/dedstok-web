export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getClientIp } from '@/lib/otp'

const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILS_PER_IDENTIFIER = 10
const MAX_FAILS_PER_IP = 30
const GENERIC_ERROR = 'Incorrect email, username, number, or password'

// Resolve email OR username OR phone → email and sign in, all server-side,
// so the account's email is never revealed to the caller.
export async function POST(request: NextRequest) {
  const { identifier, password } = await request.json()

  if (!identifier || typeof identifier !== 'string' || !password || typeof password !== 'string') {
    return NextResponse.json({ success: false, error: 'Missing credentials' }, { status: 400 })
  }

  const trimmed = identifier.trim().toLowerCase()
  const service = createServiceClient()
  const ipKey = `signin:ip:${getClientIp(request)}`
  const idKey = `signin:id:${trimmed}`
  const since = new Date(Date.now() - WINDOW_MS).toISOString()

  const [{ count: ipFails }, { count: idFails }] = await Promise.all([
    service.from('auth_attempts').select('id', { count: 'exact', head: true }).eq('key', ipKey).gte('created_at', since),
    service.from('auth_attempts').select('id', { count: 'exact', head: true }).eq('key', idKey).gte('created_at', since),
  ])

  if ((ipFails ?? 0) >= MAX_FAILS_PER_IP || (idFails ?? 0) >= MAX_FAILS_PER_IDENTIFIER) {
    return NextResponse.json(
      { success: false, error: 'Too many failed attempts. Try again in 15 minutes.' },
      { status: 429 }
    )
  }

  let email: string | null = null

  if (trimmed.includes('@')) {
    email = trimmed
  } else if (trimmed.startsWith('+') || /^\d{6,}$/.test(trimmed)) {
    const { data } = await service.from('users').select('email').eq('phone', trimmed).maybeSingle()
    email = data?.email ?? null
  } else {
    const { data } = await service.from('users').select('email').eq('username', trimmed).maybeSingle()
    email = data?.email ?? null
  }

  if (email) {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) {
      return NextResponse.json({ success: true })
    }
  }

  await service.from('auth_attempts').insert([{ key: ipKey }, { key: idKey }])

  return NextResponse.json({ success: false, error: GENERIC_ERROR }, { status: 401 })
}
