export const dynamic = 'force-dynamic'

import { createServerClient } from '@supabase/ssr'
import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const ref = searchParams.get('ref') // referral code from signup link

  if (code) {
    // Collect cookies emitted by exchangeCodeForSession so we can attach
    // them to the redirect response. Using cookies() from next/headers and
    // then returning a new NextResponse.redirect() loses them — that's the
    // mobile OAuth bug. We collect here and apply below.
    const collectedCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder',
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            // Don't write to next/headers here — collect instead
            cookiesToSet.forEach(c => collectedCookies.push(c as typeof collectedCookies[0]))
          },
        },
      }
    )

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

      const redirectUrl = needsOnboarding
        ? `${origin}/onboarding?next=${encodeURIComponent(next)}`
        : `${origin}${next}`

      const response = NextResponse.redirect(redirectUrl)

      // Attach the session cookies to the redirect response so the browser
      // stores them. Without this, mobile browsers never receive the session.
      collectedCookies.forEach(({ name, value, options }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        response.cookies.set(name, value, options as any)
      })

      return response
    }
  }

  return NextResponse.redirect(`${origin}/login?error=1`)
}
