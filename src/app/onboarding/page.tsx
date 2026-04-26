export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingForm from './OnboardingForm'

export const metadata: Metadata = {
  title: 'Complete Setup — DEDSTOK',
}

interface Props {
  searchParams: Promise<{ next?: string }>
}

export default async function OnboardingPage({ searchParams }: Props) {
  const { next } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Already onboarded — skip the form entirely
  const { data: profile } = await supabase
    .from('users')
    .select('username, phone_verified')
    .eq('id', user.id)
    .single()

  if (profile?.username && profile?.phone_verified) {
    redirect(next ?? '/')
  }

  return (
    <main style={{
      background: 'var(--void)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>

        {/* Wordmark */}
        <p style={{
          fontFamily: 'var(--font-anton)',
          fontSize: '14px',
          letterSpacing: '0.12em',
          color: 'var(--gold)',
          textTransform: 'uppercase',
          marginBottom: '48px',
        }}>
          DEDSTOK
        </p>

        <div style={{ width: '32px', height: '1px', background: 'rgba(202,138,4,0.4)', marginBottom: '24px' }} />

        <h1 style={{
          fontFamily: 'var(--font-jost)',
          fontWeight: 300,
          color: 'var(--cream)',
          fontSize: '28px',
          lineHeight: 1.2,
          marginBottom: '8px',
          letterSpacing: '-0.01em',
        }}>
          One last step
        </h1>
        <p style={{
          fontFamily: 'var(--font-jost)',
          color: 'rgba(245,237,224,0.42)',
          fontSize: '13px',
          lineHeight: 1.6,
          marginBottom: '48px',
        }}>
          Choose your username and verify your number before you enter.
        </p>

        <OnboardingForm redirectTo={next ?? '/'} />
      </div>
    </main>
  )
}
