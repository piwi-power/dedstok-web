export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSanityClient } from '@/lib/sanity/client'
import { DROP_BY_SLUG_QUERY } from '@/lib/sanity/queries'
import type { SanityDrop } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const drop = await getSanityClient().fetch<SanityDrop>(DROP_BY_SLUG_QUERY, { slug })
  if (!drop) return { title: 'Drop Not Found' }
  return {
    title: drop.item_name,
    description: drop.description,
  }
}

export default async function DropPage({ params }: Props) {
  const { slug } = await params
  const drop = await getSanityClient().fetch<SanityDrop>(DROP_BY_SLUG_QUERY, { slug })

  if (!drop) notFound()

  return (
    <main className="min-h-screen px-6 py-24 max-w-4xl mx-auto">
      <p
        style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.4em' }}
        className="text-[var(--gold)] text-xs uppercase mb-4"
      >
        Drop
      </p>
      <h1
        style={{ fontFamily: 'var(--font-serif)' }}
        className="text-[var(--cream)] text-5xl font-bold mb-4"
      >
        {drop.item_name}
      </h1>
      <p className="text-[var(--cream-dim)] mb-8 max-w-xl">{drop.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-10 max-w-sm">
        <div className="bg-[var(--walnut)] border border-[var(--gold-dim)] p-4 rounded">
          <p
            style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
            className="text-[var(--gold)] text-[9px] uppercase mb-1"
          >
            Market Value
          </p>
          <p style={{ fontFamily: 'var(--font-bebas)' }} className="text-[var(--cream)] text-3xl">
            ${drop.market_value}
          </p>
        </div>
        <div className="bg-[var(--walnut)] border border-[var(--gold-dim)] p-4 rounded">
          <p
            style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
            className="text-[var(--gold)] text-[9px] uppercase mb-1"
          >
            Entry Price
          </p>
          <p style={{ fontFamily: 'var(--font-bebas)' }} className="text-[var(--cream)] text-3xl">
            ${drop.entry_price}
          </p>
        </div>
      </div>

      {/* TODO: live spots remaining from Supabase, countdown, entry CTA */}
      <button className="bg-[var(--gold)] hover:bg-[var(--gold-light)] text-[var(--bg)] font-semibold px-8 py-4 rounded-full transition-colors">
        Enter the Raffle
      </button>
    </main>
  )
}
