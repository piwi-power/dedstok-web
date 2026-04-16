export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ReferralCopy from '@/components/ReferralCopy'
import InfluencerEarningsCard from '@/components/InfluencerEarningsCard'
import DeleteAccountButton from '@/components/DeleteAccountButton'

export const metadata: Metadata = {
  title: 'Account',
  description: 'Your entries, points, and drop history.',
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/?auth=required')

  // Fetch user profile, entry history, and influencer code in parallel
  const [profileResult, entriesResult, influencerResult] = await Promise.all([
    supabase
      .from('users')
      .select('points_balance, total_entries, total_wins, referral_code, total_referrals')
      .eq('id', user.id)
      .single(),
    supabase
      .from('entries')
      .select('id, spots_count, total_paid, created_at, drop_id, drops(item_name, slug, draw_date, status)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('influencer_codes')
      .select('code, influencer_name, instagram_handle, commission_rate, total_tickets_credited, total_commission_earned, total_pending_payout, last_payout_date, is_active, deleted_at')
      .eq('user_id', user.id)
      .single(),
  ])

  const profile = profileResult.data
  const entries = entriesResult.data ?? []
  const influencerCode = influencerResult.data ?? null

  async function signOut() {
    'use server'
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <main style={{ minHeight: '100vh', padding: '56px 32px 120px', maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '48px' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Account
          </p>
          <h1 style={{ fontFamily: 'var(--font-anton)', color: 'var(--cream)', fontSize: '64px', letterSpacing: '0.02em', lineHeight: 1, marginBottom: '8px' }}>
            YOUR PROFILE
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--cream-dim)', fontSize: '11px' }}>{user.email}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--cream-dim)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', marginTop: '8px' }}
          >
            Sign Out
          </button>
        </form>
      </div>

      {/* Creator earnings — only visible if account is linked to an influencer code */}
      {influencerCode && <InfluencerEarningsCard code={influencerCode} />}

      {/* Referral link */}
      {profile?.referral_code && (
        <div style={{ background: 'rgba(202,138,4,0.05)', border: '1px solid rgba(202,138,4,0.18)', padding: '20px', marginBottom: '32px' }}>
          <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.35)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Your Referral Link — {profile.total_referrals ?? 0} referral{profile.total_referrals !== 1 ? 's' : ''}
          </p>
          <p style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.35)', fontSize: '13px', lineHeight: 1.7, marginBottom: '12px' }}>
            Every time someone you referred buys a spot, you earn 50% of their points — forever.
          </p>
          <ReferralCopy code={profile.referral_code} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '56px' }}>
        {[
          { label: 'STOK Points', value: profile?.points_balance?.toLocaleString() ?? '0' },
          { label: 'Drops Entered', value: profile?.total_entries?.toString() ?? entries.length.toString() },
          { label: 'Wins', value: profile?.total_wins?.toString() ?? '0' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: 'var(--walnut)', border: '1px solid var(--gold-dim)', padding: '24px' }}>
            <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
              {stat.label}
            </p>
            <p style={{ fontFamily: 'var(--font-bebas)', color: 'var(--cream)', fontSize: '40px', lineHeight: 1 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '20px' }}>
        Entry History
      </p>

      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 40px', border: '1px solid rgba(202,138,4,0.15)' }}>
          <p style={{ fontFamily: 'var(--font-jost)', color: 'var(--cream-dim)', fontSize: '14px', marginBottom: '16px' }}>No entries yet.</p>
          <Link href="/" style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>
            View Current Drop
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {entries.map((entry) => {
            const drop = (entry.drops as unknown as { item_name: string; slug: string; draw_date: string; status: string } | null)
            const statusColor = drop?.status === 'drawn' ? 'var(--gold)' : drop?.status === 'active' ? '#22c55e' : 'rgba(245,237,224,0.3)'
            const statusBg = drop?.status === 'drawn' ? 'rgba(202,138,4,0.1)' : drop?.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(245,237,224,0.05)'
            return (
              <div key={entry.id} style={{ background: 'var(--walnut)', border: '1px solid rgba(245,237,224,0.06)', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, color: 'var(--cream)', fontSize: '16px', letterSpacing: '0.01em', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {drop?.item_name ?? 'Drop'}
                  </p>
                  <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--cream-dim)', fontSize: '10px' }}>
                    {entry.spots_count} spot{entry.spots_count > 1 ? 's' : ''} &middot; ${entry.total_paid} &middot; {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span style={{ fontFamily: 'var(--font-dm-mono)', color: statusColor, background: statusBg, fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '9999px' }}>
                  {drop?.status ?? 'pending'}
                </span>
              </div>
            )
          })}
        </div>
      )}
      {/* Danger zone */}
      <div style={{ marginTop: '64px', paddingTop: '32px', borderTop: '1px solid rgba(245,237,224,0.06)', display: 'flex', justifyContent: 'center' }}>
        <DeleteAccountButton />
      </div>
    </main>
  )
}
