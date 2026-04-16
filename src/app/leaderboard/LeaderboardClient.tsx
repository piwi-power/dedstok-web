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
    if (isMobile && navigator.share) {
      try { await navigator.share({ text, url: referralUrl }); return } catch {}
    }
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
    <div style={{ marginTop: '10px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={shareWhatsApp} style={shareBtn('#25D366')}>WhatsApp</button>
        <button onClick={shareTwitter} style={shareBtn('#1DA1F2')}>Twitter</button>
        <button onClick={shareInstagram} style={shareBtn('#E1306C')}>Instagram</button>
      </div>
      {igMsg && (
        <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.4)', fontSize: '10px', marginTop: '6px' }}>
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
    color,
    borderRadius: '2px',
    padding: '4px 10px',
    fontSize: '9px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontFamily: 'var(--font-dm-mono)',
    cursor: 'pointer',
  }
}

// ── Podium card ───────────────────────────────────────────────────────────────
function PodiumCard({
  entry,
  isFirst,
  isCurrentUser,
  filter,
}: {
  entry: LeaderboardEntry
  isFirst: boolean
  isCurrentUser: boolean
  filter: Filter
}) {
  const has2x = entry.rank === 1
  const show2xActive = has2x && filter === 'lastmonth'
  const show2xNext  = has2x && filter === 'thismonth'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: isFirst ? '32px 28px 28px' : '24px 20px 20px',
      border: isFirst
        ? '1px solid rgba(202,138,4,0.5)'
        : '1px solid rgba(245,237,224,0.08)',
      background: isFirst
        ? 'rgba(202,138,4,0.05)'
        : 'rgba(245,237,224,0.02)',
      boxShadow: isFirst ? '0 0 32px rgba(202,138,4,0.08)' : 'none',
      flex: isFirst ? '0 0 220px' : '0 0 180px',
      alignSelf: 'flex-end',
      position: 'relative',
    }}>
      {/* Rank numeral */}
      <span style={{
        fontFamily: 'var(--font-anton)',
        fontSize: isFirst ? '64px' : '40px',
        lineHeight: 1,
        color: isFirst
          ? 'var(--gold)'
          : entry.rank === 2 ? 'rgba(245,237,224,0.55)' : 'rgba(245,237,224,0.35)',
        marginBottom: '12px',
      }}>
        #{entry.rank}
      </span>

      {/* Email */}
      <p style={{
        fontFamily: 'var(--font-dm-mono)',
        fontSize: isFirst ? '12px' : '10px',
        color: isCurrentUser ? 'var(--cream)' : 'rgba(245,237,224,0.65)',
        letterSpacing: '0.05em',
        marginBottom: '8px',
        textAlign: 'center',
      }}>
        {maskEmail(entry.email)}
        {isCurrentUser && (
          <span style={{ color: 'var(--gold)', marginLeft: '6px', fontSize: '8px', letterSpacing: '0.15em' }}>YOU</span>
        )}
      </p>

      {/* Points */}
      <p style={{
        fontFamily: 'var(--font-anton)',
        fontSize: isFirst ? '24px' : '18px',
        color: isCurrentUser ? 'var(--gold)' : 'rgba(245,237,224,0.7)',
        letterSpacing: '0.02em',
        marginBottom: show2xNext || show2xActive ? '12px' : '0',
      }}>
        {entry.total_points.toLocaleString()}
        <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'rgba(245,237,224,0.25)', marginLeft: '6px', fontWeight: 400 }}>
          STOK
        </span>
      </p>

      {/* 2x badge */}
      {show2xNext && (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '8px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          background: 'rgba(202,138,4,0.12)',
          border: '1px solid rgba(202,138,4,0.35)',
          boxShadow: '0 0 12px rgba(202,138,4,0.12)',
          borderRadius: '9999px',
          padding: '4px 10px',
        }}>
          ↑ 2× TICKETS NEXT MONTH
        </span>
      )}
      {show2xActive && (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '8px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          background: 'rgba(202,138,4,0.12)',
          border: '1px solid rgba(202,138,4,0.35)',
          boxShadow: '0 0 12px rgba(202,138,4,0.12)',
          borderRadius: '9999px',
          padding: '4px 10px',
        }}>
          ↑ 2× BOOST ACTIVE
        </span>
      )}
    </div>
  )
}

// ── Row (rank #4 and below) ───────────────────────────────────────────────────
function Row({
  entry,
  index,
  isCurrentUser,
  filter,
  currentUserId,
}: {
  entry: LeaderboardEntry
  index: number     // 0-based position in the slice (rank 4+ = index 0+)
  isCurrentUser: boolean
  filter: Filter
  currentUserId: string | null
}) {
  const isTop1 = entry.rank === 1
  const show2xNext   = isTop1 && filter === 'thismonth'
  const show2xActive = isTop1 && filter === 'lastmonth'

  return (
    <div style={{
      padding: '18px 0',
      borderBottom: '1px solid rgba(245,237,224,0.05)',
      background: isCurrentUser ? 'rgba(202,138,4,0.03)' : 'transparent',
      borderLeft: isCurrentUser ? '2px solid var(--gold)' : '2px solid transparent',
      paddingLeft: isCurrentUser ? '16px' : '0',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{
            fontFamily: 'var(--font-anton)',
            fontSize: '18px',
            lineHeight: 1,
            color: 'rgba(245,237,224,0.2)',
            minWidth: '40px',
          }}>
            #{entry.rank}
          </span>
          <div>
            <p style={{
              fontFamily: 'var(--font-dm-mono)',
              fontSize: '12px',
              color: isCurrentUser ? 'var(--cream)' : 'rgba(245,237,224,0.65)',
              marginBottom: show2xNext || show2xActive ? '6px' : '2px',
            }}>
              {maskEmail(entry.email)}
              {isCurrentUser && (
                <span style={{ color: 'var(--gold)', fontSize: '8px', marginLeft: '8px', letterSpacing: '0.15em' }}>YOU</span>
              )}
            </p>
            {(show2xNext || show2xActive) && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '7px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                background: 'rgba(202,138,4,0.1)',
                border: '1px solid rgba(202,138,4,0.3)',
                boxShadow: '0 0 10px rgba(202,138,4,0.1)',
                borderRadius: '9999px',
                padding: '3px 8px',
              }}>
                ↑ {show2xNext ? '2× TICKETS NEXT MONTH' : '2× BOOST ACTIVE'}
              </span>
            )}
            {entry.total_referrals && entry.total_referrals > 0 ? (
              <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.25)', fontSize: '10px', marginTop: '2px' }}>
                {entry.total_referrals} referral{entry.total_referrals > 1 ? 's' : ''}
              </p>
            ) : null}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <p style={{
            fontFamily: 'var(--font-anton)',
            fontSize: '18px',
            color: isCurrentUser ? 'var(--gold)' : 'rgba(245,237,224,0.55)',
            letterSpacing: '0.02em',
          }}>
            {entry.total_points.toLocaleString()}
            <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'rgba(245,237,224,0.2)', marginLeft: '4px' }}>STOK</span>
          </p>
        </div>
      </div>

      {isCurrentUser && (
        <ShareButtons rank={entry.rank} points={entry.total_points} referralCode={entry.referral_code} />
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LeaderboardClient({
  allTime, thisMonth, prevMonth, monthName, lastMonthName, currentUserId,
}: Props) {
  const [filter, setFilter] = useState<Filter>('alltime')

  const data = filter === 'alltime' ? allTime : filter === 'thismonth' ? thisMonth : prevMonth

  const tabDescription =
    filter === 'alltime'
      ? 'Total STOK points earned since joining. Spending points does not lower this score.'
      : filter === 'thismonth'
      ? `Points earned minus points redeemed in ${monthName}. Spend less, rank higher. The #1 at month end earns 2× tickets in ${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleString('en-US', { month: 'long' })}.`
      : `Final standings for ${lastMonthName}. The #1 earned a 2× ticket boost this month.`

  const hasPodium = data.length >= 3
  const podiumEntries = hasPodium ? data.slice(0, 3) : []
  // Podium order: #2 left, #1 center, #3 right
  const podiumOrder = hasPodium
    ? [podiumEntries[1], podiumEntries[0], podiumEntries[2]]
    : []
  const listEntries = hasPodium ? data.slice(3) : data

  const filterBtn = (f: Filter, lbl: string) => (
    <button
      key={f}
      onClick={() => setFilter(f)}
      style={{
        background: filter === f ? 'var(--gold)' : 'transparent',
        color: filter === f ? 'var(--bg)' : 'rgba(245,237,224,0.35)',
        border: `1px solid ${filter === f ? 'var(--gold)' : 'rgba(245,237,224,0.12)'}`,
        borderRadius: '2px',
        padding: '7px 16px',
        fontSize: '9px',
        fontWeight: filter === f ? 700 : 400,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-dm-mono)',
        cursor: 'pointer',
      }}
    >
      {lbl}
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
      <p style={{
        fontFamily: 'var(--font-dm-mono)',
        color: 'rgba(245,237,224,0.2)',
        fontSize: '10px',
        lineHeight: 1.6,
        marginBottom: '48px',
        maxWidth: '560px',
      }}>
        {tabDescription}
      </p>

      {/* Empty state */}
      {data.length === 0 && (
        <p style={{
          fontFamily: 'var(--font-dm-mono)',
          color: 'rgba(245,237,224,0.25)',
          fontSize: '13px',
          letterSpacing: '0.05em',
          paddingTop: '24px',
        }}>
          Enter your first drop to claim your seat in the Hall.
        </p>
      )}

      {/* Podium — top 3 */}
      {hasPodium && (
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
          marginBottom: '48px',
          justifyContent: 'flex-start',
        }}>
          {podiumOrder.map((entry) => (
            <PodiumCard
              key={entry.id}
              entry={entry}
              isFirst={entry.rank === 1}
              isCurrentUser={entry.id === currentUserId}
              filter={filter}
            />
          ))}
        </div>
      )}

      {/* List — rank 4+ (or full list if no podium) */}
      {listEntries.length > 0 && (
        <div>
          {listEntries.map((entry, i) => (
            <div key={entry.id}>
              {/* THE FIELD separator — between rank 10 and 11 */}
              {entry.rank === 11 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  margin: '24px 0',
                }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(245,237,224,0.06)' }} />
                  <span style={{
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: '8px',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: 'rgba(245,237,224,0.2)',
                  }}>
                    The Field
                  </span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(245,237,224,0.06)' }} />
                </div>
              )}
              <Row
                entry={entry}
                index={i}
                isCurrentUser={entry.id === currentUserId}
                filter={filter}
                currentUserId={currentUserId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
