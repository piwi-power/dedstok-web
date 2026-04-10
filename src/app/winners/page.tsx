export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
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
      drawn_at,
      drops(item_name, slug, entry_price, total_spots, draw_date),
      users(email)
    `)
    .eq('announced', true)
    .order('drawn_at', { ascending: false })

  return (
    <main className="min-h-screen px-6 py-24 max-w-4xl mx-auto">
      <p
        style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.4em' }}
        className="text-[var(--gold)] text-xs uppercase mb-4"
      >
        Archive
      </p>
      <h1
        style={{ fontFamily: 'var(--font-serif)' }}
        className="text-[var(--cream)] text-5xl font-bold mb-12"
      >
        Winners
      </h1>

      {!winners || winners.length === 0 ? (
        <div className="text-center py-24 border border-[var(--gold-dim)] rounded">
          <p
            style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
            className="text-[var(--cream-dim)] text-xs uppercase"
          >
            First winner drops Saturday.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {winners.map((w, i) => {
            const drop = w.drops as unknown as { item_name: string; slug: string; entry_price: number; total_spots: number; draw_date: string } | null
            const winner = w.users as unknown as { email: string } | null
            const maskedEmail = winner?.email
              ? winner.email.replace(/(.{2}).*(@.*)/, '$1***$2')
              : '***'

            return (
              <div
                key={w.id}
                className="bg-[var(--walnut)] border border-[var(--gold-dim)] p-6 rounded flex items-center justify-between"
              >
                <div>
                  <p
                    style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
                    className="text-[var(--gold)] text-[9px] uppercase mb-2"
                  >
                    Drop #{(winners.length - i).toString().padStart(2, '0')} &middot;{' '}
                    {new Date(w.drawn_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p
                    style={{ fontFamily: 'var(--font-serif)' }}
                    className="text-[var(--cream)] text-xl font-bold mb-1"
                  >
                    {drop?.item_name}
                  </p>
                  <p
                    style={{ fontFamily: 'var(--font-dm-mono)' }}
                    className="text-[var(--cream-dim)] text-[10px]"
                  >
                    {drop?.total_spots} spots &middot; ${drop?.entry_price}/spot
                  </p>
                </div>
                <div className="text-right">
                  <p
                    style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
                    className="text-[var(--gold)] text-[9px] uppercase mb-1"
                  >
                    Winner
                  </p>
                  <p className="text-[var(--cream)] text-sm">{maskedEmail}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
