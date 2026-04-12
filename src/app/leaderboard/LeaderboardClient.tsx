'use client'

import { useState } from 'react'

interface LeaderboardEntry {
  id: string
  email: string
  referral_code: string
  total_points: number
  total_referrals?: number
  rank: number
}

interface Props {
  allTime: LeaderboardEntry[]
  thisMonth: LeaderboardEntry[]
  prevMonth: LeaderboardEntry[]
  monthName: string
  lastMonthName: string
  currentUserId: string | null
}

type Filter = 'alltime' | 'thismonth' | 'lastmonth'

function maskEmail(email: string) {
  return email.replace(/(.{2}).*(@.*)/, '$1***$2')
}

function ShareButtons({ rank, points, referralCode }: { rank: number; points: number; referralCode: string }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dedstok.com'
  const referralUrl = `${siteUrl}/?ref=${referralCode}`
  const text = `I'm ranked #${rank} on the DEDSTOK leaderboard with ${points} STOK points. One drop. One winner. Every week.`
  const [igMsg, setIgMsg] = useState<string | null>(null)

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + referralUrl)}`, '_blank')
  }

  function shareTwitter() {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralUrl)}`, '_blank')
  }

  async function shareInstagram() {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    // Only use native share on actual mobile — desktop Chrome supports
    // navigator.share but it won't open Instagram, so skip it there
    if (isMobile && navigator.share) {
      try {
        await navigator.share({ text, url: referralUrl })
        return
      } catch {}
    }
    // Desktop: copy to clipboard and show inline message
    setIgMsg(null)
    try {
      await navigator.clipboard.writeText(text + ' ' + referralUrl)
      setIgMsg('Copied! Open Instagram and paste into your story.')
    } catch {
      setIgMsg('Instagram sharing is only available on mobile.')
    }
    setTimeout(() => setIgMsg(null), 6000)
  }

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={shareWhatsApp} style={shareBtn('#25D366')}>WhatsApp</button>
        <button onClick={shareTwitter} style={shareBtn('#1DA1F2')}>Twitter</button>
        <button onClick={shareInstagram} style={shareBtn('#E1306C')}>Instagram</button>
      </div>
      {igMsg && (
        <p style={{ color: 'rgba(245,237,224,0.5)', fontSize: '11px', fontFamily: 'sans-serif', marginTop: '6px' }}>
          {igMsg}
        </p>
      )}
    </div>
  )
}

function shareBtn(color: string): React.CSSProperties {
  return {
    background: 'transparent',
    border: `1px solid ${color}40`,
    color: color,
    borderRadius: '4px',
    padding: '4px 10px',
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontFamily: 'sans-serif',
    cursor: 'pointer',
  }
}

export default function LeaderboardClient({ allTime, thisMonth, prevMonth, monthName, lastMonthName, currentUserId }: Props) {
  const [filter, setFilter] = useState<Filter>('alltime')

  const data = filter === 'alltime' ? allTime : filter === 'thismonth' ? thisMonth : prevMonth
  const label = filter === 'alltime' ? 'All Time' : filter === 'thismonth' ? monthName : lastMonthName

  const tabDescription =
    filter === 'alltime'
      ? 'Total STOK points earned since joining. Spending points does not lower this score.'
      : filter === 'thismonth'
      ? `Points earned minus points redeemed in ${monthName}. Spend less, rank higher. The #1 at month end earns 2x tickets in ${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleString('en-US', { month: 'long' })}.`
      : `Final standings for ${lastMonthName}. The #1 earned a 2x ticket boost this month.`

  const filterBtn = (f: Filter, label: string) => (
    <button
      key={f}
      onClick={() => setFilter(f)}
      style={{
        background: filter === f ? '#CA8A04' : 'transparent',
        color: filter === f ? '#0c0a09' : 'rgba(245,237,224,0.4)',
        border: `1px solid ${filter === f ? '#CA8A04' : 'rgba(245,237,224,0.15)'}`,
        borderRadius: '4px',
        padding: '8px 16px',
        fontSize: '11px',
        fontWeight: filter === f ? 700 : 400,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontFamily: 'sans-serif',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )

  return (
    <div>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {filterBtn('alltime', 'All Time')}
        {filterBtn('thismonth', monthName)}
        {filterBtn('lastmonth', lastMonthName)}
      </div>
      <p style={{ color: 'rgba(245,237,224,0.25)', fontSize: '11px', fontFamily: 'sans-serif', lineHeight: 1.5, marginBottom: '28px' }}>
        {tabDescription}
      </p>

      {data.length === 0 ? (
        <p style={{ color: 'rgba(245,237,224,0.3)', fontSize: '14px' }}>No data for {label} yet.</p>
      ) : (
        <div>
          {data.map((entry, i) => {
            const isCurrentUser = entry.id === currentUserId
            const isTop1 = entry.rank === 1

            return (
              <div
                key={entry.id}
                style={{
                  padding: '20px 0',
                  borderBottom: '1px solid rgba(245,237,224,0.06)',
                  background: isCurrentUser ? 'rgba(202,138,4,0.04)' : 'transparent',
                  borderLeft: isCurrentUser ? '2px solid #CA8A04' : '2px solid transparent',
                  paddingLeft: isCurrentUser ? '16px' : '0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    {/* Rank */}
                    <span style={{
                      color: isTop1 ? '#CA8A04' : i < 3 ? 'rgba(202,138,4,0.6)' : 'rgba(245,237,224,0.25)',
                      fontFamily: 'monospace',
                      fontSize: isTop1 ? '20px' : '16px',
                      fontWeight: 700,
                      minWidth: '32px',
                    }}>
                      #{entry.rank}
                    </span>
                    <div>
                      <p style={{ color: isCurrentUser ? '#f5ede0' : 'rgba(245,237,224,0.7)', fontSize: '14px', marginBottom: '2px' }}>
                        {maskEmail(entry.email)}
                        {isCurrentUser && <span style={{ color: '#CA8A04', fontSize: '10px', marginLeft: '8px', letterSpacing: '0.1em' }}>YOU</span>}
                        {isTop1 && filter === 'thismonth' && <span style={{ color: '#CA8A04', fontSize: '10px', marginLeft: '8px', letterSpacing: '0.1em' }}>2x TICKETS NEXT MONTH</span>}
                        {isTop1 && filter === 'lastmonth' && <span style={{ background: 'rgba(202,138,4,0.15)', color: '#CA8A04', fontSize: '10px', marginLeft: '8px', letterSpacing: '0.1em', padding: '2px 6px', borderRadius: '2px', border: '1px solid rgba(202,138,4,0.3)' }}>2x BOOST ACTIVE</span>}
                      </p>
                      {entry.total_referrals && entry.total_referrals > 0 ? (
                        <p style={{ color: 'rgba(245,237,224,0.3)', fontSize: '11px' }}>
                          {entry.total_referrals} referral{entry.total_referrals > 1 ? 's' : ''}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: isCurrentUser ? '#CA8A04' : 'rgba(245,237,224,0.6)', fontFamily: 'monospace', fontSize: '16px', fontWeight: 700 }}>
                      {entry.total_points.toLocaleString()}
                      <span style={{ color: 'rgba(245,237,224,0.3)', fontSize: '11px', fontWeight: 400, marginLeft: '4px' }}>STOK earned</span>
                    </p>
                  </div>
                </div>

                {/* Share buttons — only for current user's own row */}
                {isCurrentUser && (
                  <ShareButtons
                    rank={entry.rank}
                    points={entry.total_points}
                    referralCode={entry.referral_code}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
