import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const service = createServiceClient()

  // Deleting from auth.users cascades to public.users, entries,
  // points_transactions — everything tied to this account
  const { error } = await service.auth.admin.deleteUser(user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Sign out the session
  await supabase.auth.signOut()

  return NextResponse.json({ success: true })
}
