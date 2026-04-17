export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import EntryButton from '@/components/EntryButton'
import CountdownTimer from '@/components/CountdownTimer'

export const metadata: Metadata = {
  title: 'This Week — DEDSTOK',
  description: 'One drop. One winner. Every week.',
}

export default async function DropsPage() {
  const supabase = await createClient()

  const [{ data: activeDrop }, userResult] = await Promise.all([
    supabase
      .from('drops')
      .select('id, item_name, slug, description, entry_price, total_spots, spots_sold, draw_date, market_value, status, image_url, quote, quote_attribution')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    supabase.auth.getUser(),
  ])

  const user = userResult.data.user

  if (!activeDrop) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '20px' }}>
          No Active Drop
        </p>
        <h1 style={{ fontFamily: 'var(--font-anton)', color: 'var(--cream)', fontSize: 'clamp(40px, 8vw, 80px)', letterSpacing: '0.02em', lineHeight: 1, marginBottom: '48px' }}>
          NEXT DROP SUNDAY
        </h1>

        {/* Instagram CTA */}
        <div style={{ borderTop: '1px solid rgba(245,237,224,0.07)', paddingTop: '40px', marginBottom: '40px' }}>
          <p style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.35)', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px', maxWidth: '340px' }}>
            Drops sell out fast. Be there when it goes live.
          </p>
          <a
            href="https://www.instagram.com/dedstokdedstok"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'var(--font-dm-mono)',
              fontSize: '11px',
              letterSpacing: '0.15em',
              color: 'var(--cream)',
              textDecoration: 'none',
              border: '1px solid rgba(245,237,224,0.12)',
              padding: '12px 20px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
            @dedstokdedstok
          </a>
        </div>

        <Link href="/drops/archive" style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.2)', fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', textDecoration: 'none' }}>
          Past Drops →
        </Link>
      </main>
    )
  }

  const spotsRemaining = activeDrop.total_spots - activeDrop.spots_sold
  const progressPct = Math.min(100, (activeDrop.spots_sold / activeDrop.total_spots) * 100)

  const stats = [
    ...(activeDrop.market_value ? [{ label: 'Market Value', value: `$${activeDrop.market_value.toLocaleString()}` }] : []),
    { label: 'Entry', value: `$${activeDrop.entry_price}` },
    { label: 'Odds', value: `1 in ${activeDrop.total_spots}` },
    { label: 'Spots Left', value: String(spotsRemaining) },
  ]

  return (
    <>
      <style>{`
        .drop-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }
        .drop-image-panel {
          position: relative;
          min-height: 100vh;
        }
        @media (max-width: 768px) {
          .drop-split { grid-template-columns: 1fr; }
          .drop-image-panel { min-height: 60vw !important; }
          .drop-info-panel { padding: 48px 24px 80px !important; }
        }
      `}</style>

      <main className="drop-split">

        {/* Left: Image */}
        <div className="drop-image-panel" style={{ background: 'var(--walnut)' }}>
          {activeDrop.image_url ? (
            <img
              src={activeDrop.image_url}
              alt={activeDrop.item_name}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.06)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                No image
              </p>
            </div>
          )}

          {/* Live badge */}
          <div style={{ position: 'absolute', top: '80px', left: '24px', background: 'rgba(12,10,9,0.7)', backdropFilter: 'blur(8px)', padding: '5px 12px' }}>
            <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
              Live Drop
            </p>
          </div>

        </div>

        {/* Right: Info */}
        <div
          className="drop-info-panel"
          style={{ padding: '100px 56px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#0c0a09' }}
        >
          <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '20px' }}>
            This Week
          </p>

          <h1 style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontWeight: 700,
            color: 'var(--cream)',
            fontSize: 'clamp(36px, 4vw, 68px)',
            letterSpacing: '0.01em',
            textTransform: 'uppercase',
            lineHeight: 1,
            marginBottom: '24px',
          }}>
            {activeDrop.item_name}
          </h1>

          {activeDrop.description && (
            <p style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.65)', fontSize: '14px', lineHeight: 1.75, marginBottom: '28px', maxWidth: '480px' }}>
              {activeDrop.description}
            </p>
          )}

          {/* Quote */}
          {activeDrop.quote && (
            <div style={{ borderLeft: '2px solid rgba(202,138,4,0.35)', paddingLeft: '16px', marginBottom: '32px', maxWidth: '420px' }}>
              <p style={{ fontFamily: 'var(--font-jost)', fontStyle: 'italic', color: 'rgba(245,237,224,0.45)', fontSize: '13px', lineHeight: 1.65, marginBottom: activeDrop.quote_attribution ? '6px' : '0' }}>
                &ldquo;{activeDrop.quote}&rdquo;
              </p>
              {activeDrop.quote_attribution && (
                <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.40)', fontSize: '9px', letterSpacing: '0.12em' }}>
                  &mdash; {activeDrop.quote_attribution}
                </p>
              )}
            </div>
          )}

          {/* Countdown */}
          <div style={{ marginBottom: '32px' }}>
            <CountdownTimer drawDate={activeDrop.draw_date} />
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', border: '1px solid rgba(202,138,4,0.15)', marginBottom: '20px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {stats.map((stat, i) => (
              <div key={stat.label} style={{
                flex: 1,
                minWidth: '72px',
                padding: '12px 16px',
                borderRight: i < stats.length - 1 ? '1px solid rgba(202,138,4,0.1)' : 'none',
              }}>
                <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.5)', fontSize: '7px', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '4px', whiteSpace: 'nowrap' }}>
                  {stat.label}
                </p>
                <p style={{ fontFamily: 'var(--font-bebas)', color: 'var(--cream)', fontSize: '22px', lineHeight: 1 }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ height: '1px', background: 'rgba(245,237,224,0.06)', marginBottom: '8px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${progressPct}%`, background: 'var(--gold)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.38)', fontSize: '9px' }}>
                {activeDrop.spots_sold} taken
              </p>
              <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.38)', fontSize: '9px' }}>
                {spotsRemaining} left of {activeDrop.total_spots}
              </p>
            </div>
          </div>

          {/* Entry */}
          <div style={{ marginBottom: '56px' }}>
            <EntryButton
              dropId={activeDrop.id}
              dropSlug={activeDrop.slug}
              spotsRemaining={spotsRemaining}
              isActive={true}
              isLoggedIn={!!user}
            />
          </div>

          {/* Archive link */}
          <Link href="/drops/archive" style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.18)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none', alignSelf: 'flex-start' }}>
            Past Drops →
          </Link>
        </div>
      </main>
    </>
  )
}
