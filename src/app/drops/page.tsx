export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

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
      .select('id, item_name, slug, entry_price, total_spots, spots_sold, draw_date, market_value, image_url, status')
      .in('status', ['drawn', 'closed'])
      .order('draw_date', { ascending: false })
      .limit(20),
  ])

  // Fetch announced winners for past drops
  let winnersMap: Record<string, string> = {}
  if (pastDrops && pastDrops.length > 0) {
    const drawnIds = pastDrops.filter(d => d.status === 'drawn').map(d => d.id)
    if (drawnIds.length > 0) {
      const { data: winners } = await service
        .from('winners')
        .select('drop_id, announced, users(email)')
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
    <main style={{ minHeight: '100vh', padding: '60px 24px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Current drop */}
      <p style={{ color: '#CA8A04', fontFamily: 'sans-serif', fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '16px' }}>
        This Week
      </p>
      <h1 style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '40px', fontWeight: 700, marginBottom: '48px' }}>
        Current Drop
      </h1>

      {!activeDrop ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', border: '1px solid rgba(202,138,4,0.2)', borderRadius: '4px', marginBottom: '80px' }}>
          <p style={{ color: 'rgba(245,237,224,0.4)', fontFamily: 'sans-serif', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Next drop revealed Sunday.
          </p>
        </div>
      ) : (
        <Link href={`/drops/${activeDrop.slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '80px' }}>
          <div style={{ border: '1px solid rgba(202,138,4,0.25)', borderRadius: '4px', overflow: 'hidden' }}>
            {activeDrop.image_url && (
              <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: 'rgba(245,237,224,0.03)' }}>
                <img src={activeDrop.image_url} alt={activeDrop.item_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            )}
            <div style={{ padding: '40px' }}>
              <p style={{ color: '#CA8A04', fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Live Now
              </p>
              <h2 style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
                {activeDrop.item_name}
              </h2>
              {activeDrop.description && (
                <p style={{ color: 'rgba(245,237,224,0.55)', fontFamily: 'sans-serif', fontSize: '14px', lineHeight: 1.6, marginBottom: '32px' }}>
                  {activeDrop.description}
                </p>
              )}
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ color: 'rgba(245,237,224,0.35)', fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>Entry</p>
                  <p style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '18px', fontWeight: 700 }}>${activeDrop.entry_price}</p>
                </div>
                <div>
                  <p style={{ color: 'rgba(245,237,224,0.35)', fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>Draw</p>
                  <p style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '18px', fontWeight: 700 }}>
                    {new Date(activeDrop.draw_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p style={{ color: 'rgba(245,237,224,0.35)', fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>Spots Left</p>
                  <p style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '18px', fontWeight: 700 }}>
                    {activeDrop.total_spots - activeDrop.spots_sold}
                  </p>
                </div>
                {activeDrop.market_value && (
                  <div>
                    <p style={{ color: 'rgba(245,237,224,0.35)', fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>Market Value</p>
                    <p style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '18px', fontWeight: 700 }}>${activeDrop.market_value.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Past drops */}
      {pastDrops && pastDrops.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
            <p style={{ color: 'rgba(245,237,224,0.2)', fontFamily: 'sans-serif', fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              The Archive
            </p>
            <div style={{ flex: 1, height: '1px', background: 'rgba(245,237,224,0.07)' }} />
            <p style={{ color: 'rgba(245,237,224,0.15)', fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {pastDrops.length} drop{pastDrops.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {pastDrops.map(drop => {
              const fillRate = drop.total_spots > 0 ? Math.round((drop.spots_sold / drop.total_spots) * 100) : 0
              const revenue = drop.spots_sold * drop.entry_price
              const isDrawn = drop.status === 'drawn'
              const winner = winnersMap[drop.id]
              const valueMultiple = drop.market_value && drop.entry_price
                ? (drop.market_value / drop.entry_price).toFixed(0)
                : null

              return (
                <Link key={drop.id} href={`/drops/${drop.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ border: '1px solid rgba(245,237,224,0.07)', borderRadius: '4px', overflow: 'hidden', background: 'rgba(245,237,224,0.02)', transition: 'border-color 0.15s' }}>
                    {/* Thumbnail */}
                    {drop.image_url ? (
                      <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: 'rgba(245,237,224,0.04)', position: 'relative' }}>
                        <img src={drop.image_url} alt={drop.item_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'grayscale(30%)' }} />
                        {isDrawn && winner && (
                          <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.75)', padding: '3px 8px', borderRadius: '2px' }}>
                            <p style={{ color: '#CA8A04', fontFamily: 'sans-serif', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                              Won by {winner}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ width: '100%', aspectRatio: '16/9', background: 'rgba(245,237,224,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ color: 'rgba(245,237,224,0.1)', fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>No image</p>
                      </div>
                    )}

                    <div style={{ padding: '20px' }}>
                      {/* Status badge */}
                      <span style={{
                        display: 'inline-block',
                        background: isDrawn ? 'rgba(202,138,4,0.12)' : 'rgba(245,237,224,0.06)',
                        color: isDrawn ? '#CA8A04' : 'rgba(245,237,224,0.3)',
                        fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase',
                        padding: '2px 7px', borderRadius: '2px', marginBottom: '10px', fontFamily: 'sans-serif',
                      }}>
                        {isDrawn ? 'Drawn' : 'Closed'}
                      </span>

                      <p style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '15px', fontWeight: 600, marginBottom: '16px', lineHeight: 1.3 }}>
                        {drop.item_name}
                      </p>

                      {/* Stats grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <div>
                          <p style={{ color: 'rgba(245,237,224,0.3)', fontFamily: 'sans-serif', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '3px' }}>Entry</p>
                          <p style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '14px', fontWeight: 600 }}>${drop.entry_price}</p>
                        </div>
                        <div>
                          <p style={{ color: 'rgba(245,237,224,0.3)', fontFamily: 'sans-serif', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '3px' }}>Entries Sold</p>
                          <p style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '14px', fontWeight: 600 }}>{drop.spots_sold} / {drop.total_spots}</p>
                        </div>
                        {drop.market_value && (
                          <div>
                            <p style={{ color: 'rgba(245,237,224,0.3)', fontFamily: 'sans-serif', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '3px' }}>Market Value</p>
                            <p style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '14px', fontWeight: 600 }}>${drop.market_value.toLocaleString()}</p>
                          </div>
                        )}
                        {valueMultiple && (
                          <div>
                            <p style={{ color: 'rgba(245,237,224,0.3)', fontFamily: 'sans-serif', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '3px' }}>Value / Entry</p>
                            <p style={{ color: '#22c55e', fontFamily: 'sans-serif', fontSize: '14px', fontWeight: 600 }}>{valueMultiple}x</p>
                          </div>
                        )}
                      </div>

                      {/* Fill rate bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <p style={{ color: 'rgba(245,237,224,0.25)', fontFamily: 'sans-serif', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Fill rate</p>
                          <p style={{ color: fillRate === 100 ? '#22c55e' : 'rgba(245,237,224,0.4)', fontFamily: 'sans-serif', fontSize: '9px', fontWeight: 600 }}>{fillRate}%</p>
                        </div>
                        <div style={{ height: '2px', background: 'rgba(245,237,224,0.07)', borderRadius: '1px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${fillRate}%`, background: fillRate === 100 ? '#22c55e' : '#CA8A04', borderRadius: '1px' }} />
                        </div>
                      </div>

                      {/* Draw date */}
                      <div style={{ marginTop: '14px' }}>
                        <p style={{ color: 'rgba(245,237,224,0.2)', fontFamily: 'sans-serif', fontSize: '10px' }}>
                          {new Date(drop.draw_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
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
