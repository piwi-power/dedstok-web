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
    <main style={{ minHeight: '100vh', padding: '60px 24px', maxWidth: '900px', margin: '0 auto' }}>
      <p style={{ color: '#CA8A04', fontFamily: 'sans-serif', fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '16px' }}>
        Archive
      </p>
      <h1 style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '40px', fontWeight: 700, marginBottom: '12px' }}>
        Winners
      </h1>
      <p style={{ color: 'rgba(245,237,224,0.4)', fontFamily: 'sans-serif', fontSize: '12px', marginBottom: '56px', lineHeight: 1.6 }}>
        Every draw is provably fair. Each winner row includes the total ticket pool, the winning ticket number, and a SHA-256 verification hash you can independently verify.
      </p>

      {!winners || winners.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', border: '1px solid rgba(202,138,4,0.2)', borderRadius: '4px' }}>
          <p style={{ color: 'rgba(245,237,224,0.4)', fontFamily: 'sans-serif', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
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
                    <p style={{ color: '#CA8A04', fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Drop #{(winners.length - i).toString().padStart(2, '0')} &middot;{' '}
                      {new Date(w.drawn_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
                      {drop?.item_name}
                    </p>
                    <p style={{ color: 'rgba(245,237,224,0.4)', fontFamily: 'sans-serif', fontSize: '11px' }}>
                      {drop?.total_spots} total spots &middot; ${drop?.entry_price}/spot
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'rgba(245,237,224,0.4)', fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Winner
                    </p>
                    <p style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '14px' }}>{maskedEmail}</p>
                  </div>
                </div>

                {/* Provability row */}
                {w.total_tickets && w.winning_ticket !== null && (
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(245,237,224,0.04)', borderRadius: '4px', padding: '10px 14px' }}>
                      <p style={{ color: 'rgba(245,237,224,0.35)', fontFamily: 'sans-serif', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '2px' }}>
                        Winning ticket
                      </p>
                      <p style={{ color: '#f5ede0', fontFamily: 'monospace', fontSize: '13px' }}>
                        #{(w.winning_ticket as number) + 1} of {w.total_tickets}
                      </p>
                    </div>
                    {w.verification_hash && (
                      <div style={{ background: 'rgba(245,237,224,0.04)', borderRadius: '4px', padding: '10px 14px', flex: 1, minWidth: '200px' }}>
                        <p style={{ color: 'rgba(245,237,224,0.35)', fontFamily: 'sans-serif', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '2px' }}>
                          SHA-256 verification hash
                        </p>
                        <p style={{ color: 'rgba(245,237,224,0.6)', fontFamily: 'monospace', fontSize: '10px', wordBreak: 'break-all', marginBottom: '8px' }}>
                          {w.verification_hash as string}
                        </p>
                        <Link
                          href={`/verify/${w.drop_id}`}
                          style={{ color: '#CA8A04', fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}
                        >
                          Verify this draw &rarr;
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
