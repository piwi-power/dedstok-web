export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const VALID_USERNAME = /^[a-z0-9_]{3,20}$/

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('u')?.toLowerCase().trim()

  if (!username) {
    return NextResponse.json({ available: false, error: 'Missing username' }, { status: 400 })
  }

  if (!VALID_USERNAME.test(username)) {
    return NextResponse.json({
      available: false,
      error: 'Usernames can only contain lowercase letters, numbers, and underscores (3–20 characters)',
    })
  }

  const service = createServiceClient()
  const { data } = await service
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  return NextResponse.json({ available: !data })
}
