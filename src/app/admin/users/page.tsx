export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'

export default async function AdminUsersPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (!session || session !== process.env.ADMIN_SECRET) {
    redirect('/admin/login')
  }

  const supabase = createServiceClient()

  const { data: users } = await supabase
    .from('users')
    .select('id, email, phone, phone_verified, full_name, created_at, total_entries, total_referrals, points_balance, points_earned_all_time, referral_code, referrer_id')
    .order('created_at', { ascending: false })

  const { data: entries } = await supabase
    .from('entries')
    .select('user_id, total_paid, spots_count')

  // Total spent per user
  const spentByUser = (entries ?? []).reduce<Record<string, number>>((acc, e) => {
    acc[e.user_id] = (acc[e.user_id] ?? 0) + Number(e.total_paid ?? 0)
    return acc
  }, {})

  // Referrer email lookup
  const referrerIds = [...new Set((users ?? []).map(u => u.referrer_id).filter(Boolean))]
  let referrerEmails: Record<string, string> = {}
  if (referrerIds.length > 0) {
    const { data: referrers } = await supabase
      .from('users')
      .select('id, email')
      .in('id', referrerIds)
    referrerEmails = (referrers ?? []).reduce<Record<string, string>>((acc, r) => {
      acc[r.id] = r.email
      return acc
    }, {})
  }

  const totalUsers = users?.length ?? 0
  const totalRevenue = Object.values(spentByUser).reduce((a, b) => a + b, 0)
  const verifiedCount = users?.filter(u => u.phone_verified).length ?? 0

  const col = (label: string) => (
    <div style={{ color: 'rgba(245,237,224,0.3)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 12px', borderBottom: '1px solid rgba(245,237,224,0.06)', whiteSpace: 'nowrap' }}>
      {label}
    </div>
  )

  return (
    <main style={{ background: '#0c0a09', minHeight: '100vh', padding: '32px 24px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ color: '#CA8A04', fontSize: '20px', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '2px' }}>
              DEDSTOK
            </h1>
            <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Customers
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="/admin" style={{ color: 'rgba(245,237,224,0.35)', fontSize: '12px', textDecoration: 'none' }}>
              Dashboard
            </a>
            <a href="/" style={{ color: 'rgba(245,237,224,0.35)', fontSize: '12px', textDecoration: 'none' }}>
              Back to site
            </a>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
          {[
            { label: 'Total Users', value: totalUsers },
            { label: 'Phone Verified', value: verifiedCount },
            { label: 'Unverified', value: totalUsers - verifiedCount },
            { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}` },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(245,237,224,0.04)', border: '1px solid rgba(245,237,224,0.08)', borderRadius: '4px', padding: '20px' }}>
              <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
                {stat.label}
              </p>
              <p style={{ color: '#f5ede0', fontSize: '24px', fontWeight: 700 }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ border: '1px solid rgba(245,237,224,0.08)', borderRadius: '4px', overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.8fr 0.8fr 0.7fr 0.7fr 0.7fr 0.9fr 1.2fr', minWidth: '1100px' }}>

            {/* Header row */}
            {col('Email')}
            {col('Phone')}
            {col('Joined')}
            {col('Spent')}
            {col('Drops')}
            {col('Referrals')}
            {col('Pts Balance')}
            {col('Pts All-Time')}
            {col('Referred By')}

            {/* Data rows */}
            {(users ?? []).map((user, i) => {
              const isEven = i % 2 === 0
              const bg = isEven ? 'transparent' : 'rgba(245,237,224,0.015)'
              const cell = (content: React.ReactNode, align: 'left' | 'right' | 'center' = 'left') => (
                <div style={{ background: bg, padding: '10px 12px', borderBottom: '1px solid rgba(245,237,224,0.04)', fontSize: '12px', textAlign: align }}>
                  {content}
                </div>
              )

              return (
                <>
                  {cell(
                    <span style={{ color: 'rgba(245,237,224,0.8)', fontFamily: 'monospace', fontSize: '11px' }}>
                      {user.email}
                    </span>
                  )}
                  {cell(
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: user.phone ? 'rgba(245,237,224,0.7)' : 'rgba(245,237,224,0.2)', fontFamily: 'monospace', fontSize: '11px' }}>
                        {user.phone ?? 'Not set'}
                      </span>
                      {user.phone && (
                        <span style={{
                          fontSize: '9px',
                          letterSpacing: '0.1em',
                          padding: '1px 5px',
                          borderRadius: '2px',
                          background: user.phone_verified ? 'rgba(34,197,94,0.15)' : 'rgba(245,237,224,0.06)',
                          color: user.phone_verified ? '#22c55e' : 'rgba(245,237,224,0.3)',
                        }}>
                          {user.phone_verified ? 'Verified' : 'Unverified'}
                        </span>
                      )}
                    </div>
                  )}
                  {cell(
                    <span style={{ color: 'rgba(245,237,224,0.45)', fontSize: '11px' }}>
                      {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                  {cell(
                    <span style={{ color: spentByUser[user.id] > 0 ? '#CA8A04' : 'rgba(245,237,224,0.25)', fontWeight: spentByUser[user.id] > 0 ? 700 : 400 }}>
                      ${(spentByUser[user.id] ?? 0).toFixed(2)}
                    </span>,
                    'right'
                  )}
                  {cell(
                    <span style={{ color: 'rgba(245,237,224,0.7)', fontFamily: 'monospace' }}>
                      {user.total_entries ?? 0}
                    </span>,
                    'center'
                  )}
                  {cell(
                    <span style={{ color: user.total_referrals > 0 ? '#CA8A04' : 'rgba(245,237,224,0.3)', fontFamily: 'monospace' }}>
                      {user.total_referrals ?? 0}
                    </span>,
                    'center'
                  )}
                  {cell(
                    <span style={{ color: 'rgba(245,237,224,0.7)', fontFamily: 'monospace' }}>
                      {user.points_balance ?? 0}
                    </span>,
                    'right'
                  )}
                  {cell(
                    <span style={{ color: 'rgba(245,237,224,0.5)', fontFamily: 'monospace' }}>
                      {user.points_earned_all_time ?? 0}
                    </span>,
                    'right'
                  )}
                  {cell(
                    <span style={{ color: 'rgba(245,237,224,0.4)', fontSize: '11px', fontFamily: 'monospace' }}>
                      {user.referrer_id ? (referrerEmails[user.referrer_id] ?? 'Unknown') : '—'}
                    </span>
                  )}
                </>
              )
            })}
          </div>

          {(!users || users.length === 0) && (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <p style={{ color: 'rgba(245,237,224,0.3)', fontSize: '13px' }}>No users yet.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
