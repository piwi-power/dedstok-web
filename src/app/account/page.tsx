export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccountClient from './AccountClient'

export const metadata: Metadata = {
  title: 'Account — DEDSTOK',
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/account')

  const service = createServiceClient()
  const { data: profile } = await service
    .from('users')
    .select('username, email, phone, phone_verified, auth_provider, points_balance, total_entries, total_wins, referral_code')
    .eq('id', user.id)
    .single()

  return (
    <main style={{
      background: 'var(--void)',
      minHeight: '100vh',
      padding: '80px 24px 60px',
    }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <p style={{
            fontFamily: 'var(--font-anton)',
            fontSize: '13px',
            letterSpacing: '0.12em',
            color: 'var(--gold)',
            textTransform: 'uppercase',
            marginBottom: '32px',
          }}>
            DEDSTOK
          </p>
          <div style={{ width: '32px', height: '1px', background: 'rgba(202,138,4,0.4)', marginBottom: '20px' }} />
          <h1 style={{
            fontFamily: 'var(--font-jost)',
            fontWeight: 300,
            color: 'var(--cream)',
            fontSize: '26px',
            letterSpacing: '-0.01em',
            marginBottom: '4px',
          }}>
            {profile?.username ? `@${profile.username}` : 'Your Account'}
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '9px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(245,237,224,0.3)',
          }}>
            {profile?.auth_provider === 'google' ? 'Google account' : 'Email account'}
          </p>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: 'rgba(245,237,224,0.06)',
          border: '1px solid rgba(245,237,224,0.06)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '48px',
        }}>
          {[
            { label: 'Points', value: profile?.points_balance ?? 0 },
            { label: 'Drops Entered', value: profile?.total_entries ?? 0 },
            { label: 'Wins', value: profile?.total_wins ?? 0 },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(245,237,224,0.02)', padding: '20px 16px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '20px', color: 'var(--cream)', marginBottom: '4px' }}>
                {stat.value}
              </p>
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,237,224,0.3)' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Client-side form for editable fields */}
        <AccountClient
          email={profile?.email ?? user.email ?? ''}
          username={profile?.username ?? null}
          phone={profile?.phone ?? null}
          phoneVerified={profile?.phone_verified ?? false}
          authProvider={profile?.auth_provider ?? 'email'}
          referralCode={profile?.referral_code ?? null}
        />

        {/* Back to site */}
        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(245,237,224,0.06)' }}>
          <a href="/" style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '9px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(245,237,224,0.3)',
            textDecoration: 'none',
          }}>
            Back to site
          </a>
        </div>
      </div>
    </main>
  )
}
