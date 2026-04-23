export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import WinnerCopyHash from './WinnerCopyHash'
import BackButton from './BackButton'

export const metadata: Metadata = {
  title: 'Winners',
  description: 'Every winner. Every drop. Every week.',
}

export default async function WinnersPage() {
  const supabase = await createClient()

  const { data: winners } = await supabase
    .from('winners')
    .select(`
      id,
      drop_id,
      drawn_at,
      total_tickets,
      winning_ticket,
      verification_hash,
      drops(item_name, slug, entry_price, total_spots, draw_date, image_url),
      users(email)
    `)
    .eq('announced', true)
    .order('drawn_at', { ascending: false })

  const totalDrops  = winners?.length ?? 0

  return (
    <main style={{ minHeight: '100vh', padding: '56px 32px 120px', maxWidth: '900px', margin: '0 auto' }}>

      <BackButton />

      {/* Header */}
      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '12px' }}>
        Archive
      </p>
      <h1 style={{ fontFamily: 'var(--font-anton)', color: 'var(--cream)', fontSize: '72px', letterSpacing: '0.02em', lineHeight: 1, marginBottom: '20px' }}>
        WINNERS
      </h1>

      {/* Stat line */}
      {totalDrops > 0 && (
        <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
          {[
            `${totalDrops} drop${totalDrops !== 1 ? 's' : ''} drawn`,
            `${totalDrops} winner${totalDrops !== 1 ? 's' : ''}`,
            'provably fair',
          ].map((stat, i) => (
            <span key={i} style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.25)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              {i > 0 && <span style={{ marginRight: '24px', color: 'rgba(245,237,224,0.1)' }}>/</span>}
              {stat}
            </span>
          ))}
        </div>
      )}

      <p style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.35)', fontSize: '13px', marginBottom: '56px', lineHeight: 1.7, maxWidth: '520px' }}>
        Every draw is verifiable. Each entry records the total ticket pool, winning ticket number, and a SHA-256 hash you can independently verify.
      </p>

      {!winners || winners.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', border: '1px solid rgba(202,138,4,0.15)' }}>
          <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.25)', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            First winner drops Saturday.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '2px' }}>
          {winners.map((w, i) => {
            const drop   = w.drops as unknown as { item_name: string; slug: string; entry_price: number; total_spots: number; image_url?: string } | null
            const winner = w.users as unknown as { email: string } | null
            const maskedEmail = winner?.email
              ? winner.email.replace(/(.{2}).*(@.*)/, '$1***$2')
              : '***'

            return (
              <div
                key={w.id}
                style={{
                  padding: '28px 0',
                  borderBottom: '1px solid rgba(245,237,224,0.08)',
                }}
              >
                {/* Main row: image + info + winner */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '16px' }}>

                  {/* Thumbnail */}
                  <div style={{
                    flexShrink: 0,
                    width: '88px',
                    height: '88px',
                    background: 'rgba(245,237,224,0.04)',
                    border: '1px solid rgba(245,237,224,0.06)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    {drop?.image_url ? (
                      <img
                        src={drop.image_url}
                        alt={drop.item_name ?? ''}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'grayscale(60%)' }}
                      />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.08)', fontSize: '8px', letterSpacing: '0.1em' }}>DS</span>
                      </div>
                    )}
                  </div>

                  {/* Drop info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Drop #{(winners.length - i).toString().padStart(2, '0')}&nbsp;&middot;&nbsp;
                      {new Date(w.drawn_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, color: 'var(--cream)', fontSize: '22px', letterSpacing: '0.01em', textTransform: 'uppercase', marginBottom: '6px', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {drop?.item_name}
                    </p>
                    <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.3)', fontSize: '10px' }}>
                      {drop?.total_spots} spots&nbsp;&middot;&nbsp;${drop?.entry_price}/spot
                    </p>
                  </div>

                  {/* Winner */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.3)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Winner
                    </p>
                    <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--cream)', fontSize: '13px' }}>
                      {maskedEmail}
                    </p>
                  </div>
                </div>

                {/* Provability row */}
                {w.total_tickets && w.winning_ticket !== null && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'stretch' }}>

                    {/* Winning ticket */}
                    <div style={{ background: 'rgba(245,237,224,0.03)', border: '1px solid rgba(245,237,224,0.06)', padding: '10px 14px', flexShrink: 0 }}>
                      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.3)', fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Winning ticket
                      </p>
                      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--cream)', fontSize: '13px' }}>
                        #{(w.winning_ticket as number) + 1} of {w.total_tickets}
                      </p>
                    </div>

                    {/* Hash + copy */}
                    {w.verification_hash && (
                      <WinnerCopyHash hash={w.verification_hash as string} />
                    )}

                    {/* Verify link */}
                    {w.verification_hash && (
                      <Link
                        href={`/verify/${w.drop_id}`}
                        style={{
                          fontFamily: 'var(--font-dm-mono)',
                          color: 'var(--gold)',
                          fontSize: '9px',
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          textDecoration: 'none',
                          background: 'rgba(202,138,4,0.06)',
                          border: '1px solid rgba(202,138,4,0.2)',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Verify →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
