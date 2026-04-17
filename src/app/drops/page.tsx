export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import CountdownTimer from '@/components/CountdownTimer'

export const metadata: Metadata = {
  title: 'Drops',
  description: "This week's drop. One item. One winner.",
}

export default async function DropsPage() {
  const supabase = await createClient()
  const service = createServiceClient()

  const [{ data: activeDrop }, { data: pastDrops }] = await Promise.all([
    supabase
      .from('drops')
      .select('id, item_name, slug, description, entry_price, total_spots, spots_sold, draw_date, market_value, image_url, status')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),

    supabase
      .from('drops')
      .select('id, item_name, slug, entry_price, total_spots, draw_date, market_value, image_url, status')
      .in('status', ['drawn', 'closed'])
      .order('draw_date', { ascending: false })
      .limit(20),
  ])

  // Announced winners for past drops
  let winnersMap: Record<string, string> = {}
  if (pastDrops && pastDrops.length > 0) {
    const drawnIds = pastDrops.filter(d => d.status === 'drawn').map(d => d.id)
    if (drawnIds.length > 0) {
      const { data: winners } = await service
        .from('winners')
        .select('drop_id, users(email)')
        .in('drop_id', drawnIds)
        .eq('announced', true)

      if (winners) {
        for (const w of winners) {
          const email = (w.users as { email?: string } | null)?.email ?? ''
          const masked = email ? email.split('@')[0].slice(0, 2) + '***@' + email.split('@')[1] : 'Winner'
          winnersMap[w.drop_id] = masked
        }
      }
    }
  }

  return (
    <main style={{ minHeight: '100vh', padding: '56px 32px 120px', maxWidth: '960px', margin: '0 auto' }}>

      {/* Header */}
      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '12px' }}>
        This Week
      </p>
      <h1 style={{ fontFamily: 'var(--font-anton)', color: 'var(--cream)', fontSize: '72px', letterSpacing: '0.02em', lineHeight: 1, marginBottom: '48px' }}>
        DROPS
      </h1>

      {/* Active drop */}
      {!activeDrop ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', border: '1px solid rgba(202,138,4,0.15)', marginBottom: '80px' }}>
          <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.3)', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            Next drop revealed Sunday.
          </p>
        </div>
      ) : (
        <Link href={`/drops/${activeDrop.slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '96px' }}>
          <div style={{ border: '1px solid rgba(202,138,4,0.2)', overflow: 'hidden' }}>
            {activeDrop.image_url && (
              <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: 'var(--walnut)' }}>
                <img src={activeDrop.image_url} alt={activeDrop.item_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            )}
            <div style={{ padding: '40px' }}>
              <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Live Now
              </p>
              <h2 style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, color: 'var(--cream)', fontSize: '36px', letterSpacing: '0.01em', textTransform: 'uppercase', marginBottom: '16px', lineHeight: 1 }}>
                {activeDrop.item_name}
              </h2>
              {activeDrop.description && (
                <p style={{ fontFamily: 'var(--font-jost)', color: 'var(--cream-dim)', fontSize: '14px', lineHeight: 1.7, marginBottom: '32px', maxWidth: '560px' }}>
                  {activeDrop.description}
                </p>
              )}
              {/* Connected stats strip */}
              <div style={{
                display: 'flex',
                border: '1px solid rgba(202,138,4,0.15)',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                marginBottom: '24px',
              }}>
                {[
                  ...(activeDrop.market_value ? [{ label: 'Market Value', value: `$${activeDrop.market_value.toLocaleString()}` }] : []),
                  { label: 'Entry', value: `$${activeDrop.entry_price}` },
                  { label: 'Odds', value: `1 in ${activeDrop.total_spots}` },
                  { label: 'Spots Left', value: String(activeDrop.total_spots - activeDrop.spots_sold) },
                ].map((stat, i, arr) => (
                  <div key={stat.label} style={{
                    flex: 1,
                    minWidth: '80px',
                    padding: '14px 18px',
                    borderRight: i < arr.length - 1 ? '1px solid rgba(202,138,4,0.1)' : 'none',
                  }}>
                    <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.3)', fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '5px', whiteSpace: 'nowrap' }}>
                      {stat.label}
                    </p>
                    <p style={{ fontFamily: 'var(--font-bebas)', color: 'var(--cream)', fontSize: '24px', lineHeight: 1 }}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <CountdownTimer drawDate={activeDrop.draw_date} />
            </div>
          </div>
        </Link>
      )}

      {/* Archive */}
      {pastDrops && pastDrops.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
            <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.2)', fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              The Archive
            </p>
            <div style={{ flex: 1, height: '1px', background: 'rgba(245,237,224,0.07)' }} />
            <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.15)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {pastDrops.length} drop{pastDrops.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {pastDrops.map(drop => {
              const isDrawn = drop.status === 'drawn'
              const winner = winnersMap[drop.id]
              const valueMultiple = drop.market_value && drop.entry_price
                ? (drop.market_value / drop.entry_price).toFixed(0)
                : null

              return (
                <Link key={drop.id} href={`/drops/${drop.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ border: '1px solid rgba(245,237,224,0.07)', overflow: 'hidden', background: 'rgba(245,237,224,0.015)' }}>
                    {drop.image_url ? (
                      <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: 'var(--walnut)', position: 'relative' }}>
                        <img src={drop.image_url} alt={drop.item_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'grayscale(40%)' }} />
                        {isDrawn && winner && (
                          <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.8)', padding: '3px 8px' }}>
                            <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                              Won by {winner}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ width: '100%', aspectRatio: '16/9', background: 'var(--walnut)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.1)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>No image</p>
                      </div>
                    )}

                    <div style={{ padding: '20px' }}>
                      <span style={{
                        display: 'inline-block',
                        background: isDrawn ? 'rgba(202,138,4,0.1)' : 'rgba(245,237,224,0.05)',
                        color: isDrawn ? 'var(--gold)' : 'rgba(245,237,224,0.3)',
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase',
                        padding: '2px 8px', borderRadius: '9999px', marginBottom: '12px',
                      }}>
                        {isDrawn ? 'Drawn' : 'Closed'}
                      </span>

                      <p style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, color: 'var(--cream)', fontSize: '18px', letterSpacing: '0.01em', textTransform: 'uppercase', marginBottom: '16px', lineHeight: 1.2 }}>
                        {drop.item_name}
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <MiniStat label="Entry" value={`$${drop.entry_price}`} />
                        <MiniStat label="Odds" value={`1 in ${drop.total_spots}`} />
                        {drop.market_value && <MiniStat label="Market Value" value={`$${drop.market_value.toLocaleString()}`} />}
                        {valueMultiple && <MiniStat label="Value / Entry" value={`${valueMultiple}x`} highlight />}
                      </div>

                      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.2)', fontSize: '9px' }}>
                        {new Date(drop.draw_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </main>
  )
}

function MiniStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.3)', fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '3px' }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-jost)', fontWeight: 600, color: highlight ? '#22c55e' : 'var(--cream)', fontSize: '13px' }}>{value}</p>
    </div>
  )
}
