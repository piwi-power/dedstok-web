export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (!session || session !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { winner_id } = await request.json()
  if (!winner_id) return NextResponse.json({ error: 'winner_id required' }, { status: 400 })

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('winners')
    .update({ announced: true })
    .eq('id', winner_id)

  if (error) return NextResponse.json({ error: 'Failed to announce' }, { status: 500 })

  return NextResponse.json({ success: true })
}
