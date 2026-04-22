export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }

  const { currentPassword, newPassword } = await request.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ success: false, error: 'Both passwords required' }, { status: 400 })
  }
  if (newPassword.length < 6 || newPassword.length > 20) {
    return NextResponse.json({ success: false, error: 'New password must be 6–20 characters' }, { status: 400 })
  }
  if (currentPassword === newPassword) {
    return NextResponse.json({ success: false, error: 'New password must be different' }, { status: 400 })
  }

  // Verify current password by attempting sign-in
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (verifyError) {
    return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 })
  }

  // Update via admin API (service role)
  const service = createServiceClient()
  const { error: updateError } = await service.auth.admin.updateUserById(user.id, {
    password: newPassword,
  })

  if (updateError) {
    return NextResponse.json({ success: false, error: 'Failed to update password' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
