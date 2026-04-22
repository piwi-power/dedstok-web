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

  const [profileResult, entriesResult, influencerResult] = await Promise.all([
    service
      .from('users')
      .select('username, email, phone, phone_verified, auth_provider, points_balance, total_entries, total_wins, referral_code, total_referrals')
      .eq('id', user.id)
      .single(),
    service
      .from('entries')
      .select('id, spots_count, total_paid, created_at, drop_id, drops(item_name, slug, draw_date, status)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    service
      .from('influencer_codes')
      .select('code, influencer_name, instagram_handle, commission_rate, total_tickets_credited, total_commission_earned, total_pending_payout, last_payout_date, is_active, deleted_at')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  const profile = profileResult.data
  const entries = entriesResult.data ?? []
  const influencerCode = influencerResult.data ?? null

  return (
    <main style={{
      background: 'var(--void)',
      minHeight: '100vh',
      padding: '80px 24px 60px',
    }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-anton)',
              fontSize: '13px',
              letterSpacing: '0.12em',
              color: 'var(--gold)',
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}>
              DEDSTOK
            </p>
            <div style={{ width: '32px', height: '1px', background: 'rgba(202,138,4,0.4)', marginBottom: '16px' }} />
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
            { label: 'Points', value: (profile?.points_balance ?? 0).toLocaleString() },
            { label: 'Drops Entered', value: (profile?.total_entries ?? 0).toString() },
            { label: 'Wins', value: (profile?.total_wins ?? 0).toString() },
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

        <AccountClient
          email={profile?.email ?? user.email ?? ''}
          username={profile?.username ?? null}
          phone={profile?.phone ?? null}
          phoneVerified={profile?.phone_verified ?? false}
          authProvider={profile?.auth_provider ?? 'email'}
          referralCode={profile?.referral_code ?? null}
          totalReferrals={profile?.total_referrals ?? 0}
          entries={entries as unknown as EntryRow[]}
          influencerCode={influencerCode}
        />
      </div>
    </main>
  )
}

// Type exported for AccountClient
export type EntryRow = {
  id: string
  spots_count: number
  total_paid: number
  created_at: string
  drop_id: string
  drops: { item_name: string; slug: string; draw_date: string; status: string } | null
}

export type InfluencerCodeRow = {
  code: string
  influencer_name: string
  instagram_handle: string | null
  commission_rate: number
  total_tickets_credited: number
  total_commission_earned: number
  total_pending_payout: number
  last_payout_date: string | null
  is_active: boolean
  deleted_at?: string | null
}
