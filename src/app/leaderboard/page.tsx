export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LeaderboardClient from './LeaderboardClient'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // All-time leaderboard
  const { data: allTime } = await supabase
    .from('leaderboard_alltime')
    .select('id, email, referral_code, total_points, total_referrals, rank')
    .order('rank', { ascending: true })
    .limit(50)

  // This month
  const now = new Date()
  const { data: thisMonth } = await supabase
    .rpc('leaderboard_for_month', { p_year: now.getFullYear(), p_month: now.getMonth() + 1 })

  // Last month
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const { data: prevMonth } = await supabase
    .rpc('leaderboard_for_month', { p_year: lastMonth.getFullYear(), p_month: lastMonth.getMonth() + 1 })

  const monthName = now.toLocaleString('en-US', { month: 'long' })
  const lastMonthName = lastMonth.toLocaleString('en-US', { month: 'long' })

  return (
    <main style={{ minHeight: '100vh', padding: '80px 32px 120px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase' }}>
          Hall of Records
        </p>
        <Link href="/winners" style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.3)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none', transition: 'color 0.15s ease' }}
          onMouseEnter={undefined}>
          All Winners →
        </Link>
      </div>
      <h1 style={{ fontFamily: 'var(--font-anton)', color: 'var(--cream)', fontSize: '72px', letterSpacing: '0.02em', lineHeight: 1, marginBottom: '16px' }}>
        LEADERBOARD
      </h1>
      <p style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.35)', fontSize: '13px', lineHeight: 1.7, marginBottom: '56px', maxWidth: '520px' }}>
        The monthly #1 earns double tickets on every spot they buy the following month.
        Points never reset. Monthly rankings measure what you earned and spent within that calendar month only.
      </p>

      <LeaderboardClient
        allTime={allTime ?? []}
        thisMonth={thisMonth ?? []}
        prevMonth={prevMonth ?? []}
        monthName={monthName}
        lastMonthName={lastMonthName}
        currentUserId={user?.id ?? null}
      />
    </main>
  )
}
