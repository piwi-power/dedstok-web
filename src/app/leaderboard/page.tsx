export const dynamic = 'force-dynamic'

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
    <main style={{ minHeight: '100vh', padding: '60px 24px', maxWidth: '760px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#CA8A04', fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '16px' }}>
        Community
      </p>
      <h1 style={{ color: '#f5ede0', fontSize: '40px', fontWeight: 700, marginBottom: '8px' }}>
        Leaderboard
      </h1>
      <p style={{ color: 'rgba(245,237,224,0.4)', fontSize: '13px', marginBottom: '12px' }}>
        Ranked by total STOK points earned. The monthly #1 earns double tickets on every spot they purchase the following month.
      </p>
      <p style={{ color: 'rgba(245,237,224,0.25)', fontSize: '12px', marginBottom: '48px' }}>
        Enter at least one drop to appear on the leaderboard.
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
