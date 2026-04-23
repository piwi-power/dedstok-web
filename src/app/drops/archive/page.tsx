export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Archive — DEDSTOK',
  description: 'Every drop. Every winner.',
}

export default async function ArchivePage() {
  const supabase = await createClient()
  const service = createServiceClient()

  const [{ data: pastDrops }, { data: winners }, { data: activeDrop }] = await Promise.all([
    supabase
      .from('drops')
      .select('id, item_name, slug, entry_price, total_spots, draw_date, market_value, image_url, status')
      .in('status', ['drawn', 'closed'])
      .order('draw_date', { ascending: false })
      .limit(50),

    service
      .from('winners')
      .select('drop_id, winning_ticket, total_tickets, users(email)')
      .eq('announced', true),

    supabase
      .from('drops')
      .select('id')
      .eq('status', 'active')
      .limit(1)
      .maybeSingle(),
  ])

  // Build winner map keyed by drop_id
  const winnersMap: Record<string, { maskedEmail: string; ticket: number; total: number }> = {}
  if (winners) {
    for (const w of winners) {
      const email = (w.users as { email?: string } | null)?.email ?? ''
      const [user, domain] = email.split('@')
      const masked = user ? user.slice(0, 2) + '***@' + (domain ?? '') : 'Winner'
      winnersMap[w.drop_id] = {
        maskedEmail: masked,
        ticket: (w.winning_ticket as number) + 1,
        total: w.total_tickets,
      }
    }
  }

  return (
    <main style={{ minHeight: '100vh', padding: '80px 32px 120px', maxWidth: '1000px', margin: '0 auto' }}>

      {/* Header */}
      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '16px' }}>
        Every Drop. Every Winner.
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'var(--font-anton)', color: 'var(--cream)', fontSize: 'clamp(48px, 8vw, 80px)', letterSpacing: '0.02em', lineHeight: 1 }}>
          THE ARCHIVE
        </h1>
        <Link href="/winners" className="link-ghost" style={{ paddingBottom: '6px', flexShrink: 0 }}>
          All Winners →
        </Link>
      </div>

      {/* Current drop card */}
      <Link href="/drops" style={{ textDecoration: 'none', display: 'block', marginBottom: '56px' }}>
        <div style={{
          border: `1px solid ${activeDrop ? 'rgba(202,138,4,0.35)' : 'rgba(245,237,224,0.08)'}`,
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: activeDrop ? 'rgba(202,138,4,0.04)' : 'transparent',
        }}>
          <div>
            <p style={{ fontFamily: 'var(--font-dm-mono)', color: activeDrop ? 'var(--gold)' : 'rgba(245,237,224,0.25)', fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '6px' }}>
              {activeDrop ? 'Live Now' : 'No Active Drop'}
            </p>
            <p style={{ fontFamily: 'var(--font-jost)', color: activeDrop ? 'var(--cream)' : 'rgba(245,237,224,0.3)', fontSize: '14px' }}>
              {activeDrop ? "This week's drop is live" : 'Next drop revealed Sunday.'}
            </p>
          </div>
          {activeDrop && (
            <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.2em', flexShrink: 0, marginLeft: '24px' }}>
              Enter →
            </p>
          )}
        </div>
      </Link>

      {/* Section divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.2)', fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Past Drops
        </p>
        <div style={{ flex: 1, height: '1px', background: 'rgba(245,237,224,0.07)' }} />
        <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.15)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          {pastDrops?.length ?? 0} drops
        </p>
      </div>

      {/* Grid */}
      {!pastDrops || pastDrops.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', border: '1px solid rgba(245,237,224,0.06)' }}>
          <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.2)', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            No past drops yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {pastDrops.map(drop => {
            const isDrawn = drop.status === 'drawn'
            const winner = winnersMap[drop.id]
            const valueMultiple = drop.market_value && drop.entry_price
              ? Math.round(drop.market_value / drop.entry_price)
              : null

            return (
              <div key={drop.id} style={{ border: '1px solid rgba(245,237,224,0.07)', background: 'rgba(245,237,224,0.015)', overflow: 'hidden' }}>

                {/* Image */}
                <div style={{ width: '100%', aspectRatio: '16/9', background: 'var(--walnut)', position: 'relative', overflow: 'hidden' }}>
                  {drop.image_url ? (
                    <img
                      src={drop.image_url}
                      alt={drop.item_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'grayscale(50%)' }}
                    />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.06)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>No image</p>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(12,10,9,0.85)', padding: '3px 8px' }}>
                    <p style={{ fontFamily: 'var(--font-dm-mono)', color: isDrawn ? 'var(--gold)' : 'rgba(245,237,224,0.25)', fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                      {isDrawn ? 'Drawn' : 'Closed'}
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '20px' }}>
                  <p style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, color: 'var(--cream)', fontSize: '18px', letterSpacing: '0.01em', textTransform: 'uppercase', lineHeight: 1.2, marginBottom: '14px' }}>
                    {drop.item_name}
                  </p>

                  {/* Mini stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.25)', fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '3px' }}>Entry</p>
                      <p style={{ fontFamily: 'var(--font-jost)', fontWeight: 600, color: 'var(--cream)', fontSize: '13px' }}>${drop.entry_price}</p>
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.25)', fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '3px' }}>Odds</p>
                      <p style={{ fontFamily: 'var(--font-jost)', fontWeight: 600, color: 'var(--cream)', fontSize: '13px' }}>1 in {drop.total_spots}</p>
                    </div>
                    {drop.market_value && (
                      <div>
                        <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.25)', fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '3px' }}>Market Value</p>
                        <p style={{ fontFamily: 'var(--font-jost)', fontWeight: 600, color: 'var(--cream)', fontSize: '13px' }}>${drop.market_value.toLocaleString()}</p>
                      </div>
                    )}
                    {valueMultiple && (
                      <div>
                        <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.25)', fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '3px' }}>Value / Entry</p>
                        <p style={{ fontFamily: 'var(--font-jost)', fontWeight: 600, color: '#22c55e', fontSize: '13px' }}>{valueMultiple}x</p>
                      </div>
                    )}
                  </div>

                  <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.2)', fontSize: '9px', marginBottom: winner ? '16px' : '0' }}>
                    {new Date(drop.draw_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>

                  {/* Winner + verify */}
                  {winner && (
                    <div style={{ borderTop: '1px solid rgba(245,237,224,0.06)', paddingTop: '14px' }}>
                      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.25)', fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Winner
                      </p>
                      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--cream)', fontSize: '11px', marginBottom: '3px' }}>
                        {winner.maskedEmail}
                      </p>
                      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.35)', fontSize: '10px', marginBottom: '14px' }}>
                        Ticket #{String(winner.ticket).padStart(4, '0')} of {winner.total}
                      </p>
                      <Link
                        href={`/verify/${drop.id}`}
                        style={{
                          display: 'inline-block',
                          fontFamily: 'var(--font-dm-mono)',
                          fontSize: '8px',
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color: 'var(--gold)',
                          textDecoration: 'none',
                          border: '1px solid rgba(202,138,4,0.3)',
                          padding: '6px 12px',
                        }}
                      >
                        Verify Draw →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
