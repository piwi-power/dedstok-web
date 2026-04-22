export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const ref = searchParams.get('ref') // referral code from signup link

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const service = createServiceClient()
      const userId = data.user.id
      const email = data.user.email ?? ''

      // Generate a referral code for this user (first 8 chars of UUID, no dashes)
      const referralCode = userId.replace(/-/g, '').slice(0, 8).toLowerCase()

      // Find referrer if a ref code was passed
      let referrerId: string | null = null
      if (ref) {
        const { data: referrer } = await service
          .from('users')
          .select('id')
          .eq('referral_code', ref)
          .neq('id', userId) // can't refer yourself
          .single()
        referrerId = referrer?.id ?? null
      }

      // Upsert user row
      await service.from('users').upsert(
        {
          id: userId,
          email,
          referral_code: referralCode,
          auth_provider: 'google',
          ...(referrerId ? { referrer_id: referrerId } : {}),
        },
        {
          onConflict: 'id',
          ignoreDuplicates: false,
        }
      )

      // Google users who haven't set a username or verified their phone
      // get routed to onboarding before entering the site
      const { data: profile } = await service
        .from('users')
        .select('username, phone_verified')
        .eq('id', userId)
        .single()

      const needsOnboarding = !profile?.username || !profile?.phone_verified
      if (needsOnboarding) {
        const onboardUrl = new URL(`${origin}/onboarding`)
        onboardUrl.searchParams.set('next', next)
        return NextResponse.redirect(onboardUrl.toString())
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=1`)
}
