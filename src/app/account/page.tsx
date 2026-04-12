export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ReferralCopy from '@/components/ReferralCopy'

export const metadata: Metadata = {
  title: 'Account',
  description: 'Your entries, points, and drop history.',
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/?auth=required')

  // Fetch user profile and entry history in parallel
  const [profileResult, entriesResult] = await Promise.all([
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
  ])

  const profile = profileResult.data
  const entries = entriesResult.data ?? []

  async function signOut() {
    'use server'
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <main className="min-h-screen px-6 py-24 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-12">
        <div>
          <p
            style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.4em' }}
            className="text-[var(--gold)] text-xs uppercase mb-4"
          >
            Account
          </p>
          <h1
            style={{ fontFamily: 'var(--font-serif)' }}
            className="text-[var(--cream)] text-5xl font-bold mb-2"
          >
            Your Profile
          </h1>
          <p className="text-[var(--cream-dim)] text-sm">{user.email}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.15em' }}
            className="text-[var(--cream-dim)] text-[10px] uppercase hover:text-[var(--cream)] transition-colors mt-4"
          >
            Sign Out
          </button>
        </form>
      </div>

      {/* Referral link */}
      {profile?.referral_code && (
        <div style={{ background: 'rgba(202,138,4,0.06)', border: '1px solid rgba(202,138,4,0.2)', borderRadius: '4px', padding: '20px', marginBottom: '32px' }}>
          <p style={{ color: 'rgba(245,237,224,0.4)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '8px' }}>
            Your Referral Link — {profile.total_referrals ?? 0} referral{profile.total_referrals !== 1 ? 's' : ''}
          </p>
          <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '12px', fontFamily: 'sans-serif', marginBottom: '12px' }}>
            Every time someone you referred buys a spot, you earn 50% of their points — forever. The more they enter, the more you earn.
          </p>
          <ReferralCopy code={profile.referral_code} />
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-16">
        {[
          { label: 'STOK Points', value: profile?.points_balance?.toLocaleString() ?? '0' },
          { label: 'Drops Entered', value: profile?.total_entries?.toString() ?? entries.length.toString() },
          { label: 'Wins', value: profile?.total_wins?.toString() ?? '0' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--walnut)] border border-[var(--gold-dim)] p-6 rounded"
          >
            <p
              style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
              className="text-[var(--gold)] text-[10px] uppercase mb-2"
            >
              {stat.label}
            </p>
            <p
              style={{ fontFamily: 'var(--font-bebas)' }}
              className="text-[var(--cream)] text-4xl"
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <h2
        style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
        className="text-[var(--gold)] text-xs uppercase mb-6"
      >
        Entry History
      </h2>

      {entries.length === 0 ? (
        <div className="text-center py-16 border border-[var(--gold-dim)] rounded">
          <p className="text-[var(--cream-dim)] text-sm mb-4">No entries yet.</p>
          <Link
            href="/"
            style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
            className="text-[var(--gold)] text-xs uppercase hover:text-[var(--gold-light)] transition-colors"
          >
            View Current Drop
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const drop = (entry.drops as unknown as { item_name: string; slug: string; draw_date: string; status: string } | null)
            return (
              <div
                key={entry.id}
                className="bg-[var(--walnut)] border border-[var(--gold-dim)] p-5 rounded flex items-center justify-between"
              >
                <div>
                  <p className="text-[var(--cream)] text-sm font-medium mb-1">
                    {drop?.item_name ?? 'Drop'}
                  </p>
                  <p
                    style={{ fontFamily: 'var(--font-dm-mono)' }}
                    className="text-[var(--cream-dim)] text-[10px]"
                  >
                    {entry.spots_count} spot{entry.spots_count > 1 ? 's' : ''} &middot; ${entry.total_paid} &middot;{' '}
                    {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.15em' }}
                    className={`text-[10px] uppercase px-2 py-1 rounded ${
                      drop?.status === 'drawn'
                        ? 'bg-[var(--gold-dim)] text-[var(--gold)]'
                        : drop?.status === 'active'
                        ? 'bg-green-900/30 text-green-400'
                        : 'text-[var(--cream-dim)]'
                    }`}
                  >
                    {drop?.status ?? 'pending'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
