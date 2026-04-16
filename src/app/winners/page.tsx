export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

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
      drops(item_name, slug, entry_price, total_spots, draw_date),
      users(email)
    `)
    .eq('announced', true)
    .order('drawn_at', { ascending: false })

  return (
    <main style={{ minHeight: '100vh', padding: '56px 32px 120px', maxWidth: '900px', margin: '0 auto' }}>
      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '12px' }}>
        Archive
      </p>
      <h1 style={{ fontFamily: 'var(--font-anton)', color: 'var(--cream)', fontSize: '72px', letterSpacing: '0.02em', lineHeight: 1, marginBottom: '16px' }}>
        WINNERS
      </h1>
      <p style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.35)', fontSize: '13px', marginBottom: '56px', lineHeight: 1.7, maxWidth: '520px' }}>
        Every draw is provably fair. Each entry includes the total ticket pool, winning ticket number, and a SHA-256 hash you can independently verify.
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
            const drop = w.drops as unknown as { item_name: string; slug: string; entry_price: number; total_spots: number } | null
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Drop #{(winners.length - i).toString().padStart(2, '0')} &middot;{' '}
                      {new Date(w.drawn_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, color: 'var(--cream)', fontSize: '24px', letterSpacing: '0.01em', textTransform: 'uppercase', marginBottom: '6px', lineHeight: 1 }}>
                      {drop?.item_name}
                    </p>
                    <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.3)', fontSize: '10px' }}>
                      {drop?.total_spots} total spots &middot; ${drop?.entry_price}/spot
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.3)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Winner
                    </p>
                    <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--cream)', fontSize: '13px' }}>{maskedEmail}</p>
                  </div>
                </div>

                {/* Provability row */}
                {w.total_tickets && w.winning_ticket !== null && (
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(245,237,224,0.03)', border: '1px solid rgba(245,237,224,0.06)', padding: '10px 14px' }}>
                      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.3)', fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Winning ticket
                      </p>
                      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--cream)', fontSize: '13px' }}>
                        #{(w.winning_ticket as number) + 1} of {w.total_tickets}
                      </p>
                    </div>
                    {w.verification_hash && (
                      <div style={{ background: 'rgba(245,237,224,0.03)', border: '1px solid rgba(245,237,224,0.06)', padding: '10px 14px', flex: 1, minWidth: '200px' }}>
                        <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.3)', fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>
                          SHA-256 verification hash
                        </p>
                        <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.45)', fontSize: '10px', wordBreak: 'break-all', marginBottom: '10px' }}>
                          {w.verification_hash as string}
                        </p>
                        <Link
                          href={`/verify/${w.drop_id}`}
                          style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}
                        >
                          Verify this draw →
                        </Link>
                      </div>
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
