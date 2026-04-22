export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Resolve email OR username OR phone → email for signInWithPassword
export async function POST(request: NextRequest) {
  const { identifier } = await request.json()

  if (!identifier || typeof identifier !== 'string') {
    return NextResponse.json({ error: 'Missing identifier' }, { status: 400 })
  }

  const trimmed = identifier.trim()
  const service = createServiceClient()
  let email: string | null = null

  if (trimmed.includes('@')) {
    // Email — use directly
    email = trimmed.toLowerCase()
  } else if (trimmed.startsWith('+') || /^\d{6,}$/.test(trimmed)) {
    // Phone (E.164 or raw digits)
    const phone = trimmed.startsWith('+') ? trimmed : trimmed
    const { data } = await service
      .from('users')
      .select('email')
      .eq('phone', phone)
      .maybeSingle()
    email = data?.email ?? null
  } else {
    // Username — case-insensitive lookup
    const { data } = await service
      .from('users')
      .select('email')
      .eq('username', trimmed.toLowerCase())
      .maybeSingle()
    email = data?.email ?? null
  }

  if (!email) {
    return NextResponse.json({ error: 'No account found with that email, username, or number' }, { status: 404 })
  }

  return NextResponse.json({ email })
}
