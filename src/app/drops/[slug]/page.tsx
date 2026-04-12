export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSanityClient } from '@/lib/sanity/client'
import { DROP_BY_SLUG_QUERY } from '@/lib/sanity/queries'
import { createClient } from '@/lib/supabase/server'
import EntryButton from '@/components/EntryButton'
import BackButton from '@/components/BackButton'
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

  // Fetch content from Sanity and live data from Supabase in parallel
  const [drop, supabase] = await Promise.all([
    getSanityClient().fetch<SanityDrop>(DROP_BY_SLUG_QUERY, { slug }),
    createClient(),
  ])

  if (!drop) notFound()

  // Fetch live drop data (spots_sold, status, id) from Supabase
  const { data: liveDrop } = await supabase
    .from('drops')
    .select('id, spots_sold, status, total_spots')
    .eq('slug', slug)
    .single()

  const { data: { user } } = await supabase.auth.getUser()

  const spotsRemaining = liveDrop
    ? liveDrop.total_spots - liveDrop.spots_sold
    : drop.total_spots

  const isActive = liveDrop?.status === 'active'
  const drawDate = new Date(drop.draw_date)

  return (
    <main className="min-h-screen px-6 py-24 max-w-4xl mx-auto">
      <BackButton href="/drops" />
      <p
        style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.4em' }}
        className="text-[var(--gold)] text-xs uppercase mb-4"
      >
        {isActive ? 'Live Drop' : 'Drop'}
      </p>

      <h1
        style={{ fontFamily: 'var(--font-serif)' }}
        className="text-[var(--cream)] text-5xl font-bold mb-4"
      >
        {drop.item_name}
      </h1>

      <p className="text-[var(--cream-dim)] mb-10 max-w-xl">{drop.description}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 max-w-2xl">
        <div className="bg-[var(--walnut)] border border-[var(--gold-dim)] p-4 rounded">
          <p
            style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
            className="text-[var(--gold)] text-[9px] uppercase mb-1"
          >
            Market Value
          </p>
          <p style={{ fontFamily: 'var(--font-bebas)' }} className="text-[var(--cream)] text-3xl">
            ${drop.market_value?.toLocaleString()}
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

        <div className="bg-[var(--walnut)] border border-[var(--gold-dim)] p-4 rounded">
          <p
            style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
            className="text-[var(--gold)] text-[9px] uppercase mb-1"
          >
            Odds per spot
          </p>
          <p style={{ fontFamily: 'var(--font-bebas)' }} className="text-[var(--cream)] text-3xl">
            1 in {drop.total_spots}
          </p>
        </div>

        <div className="bg-[var(--walnut)] border border-[var(--gold-dim)] p-4 rounded">
          <p
            style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
            className="text-[var(--gold)] text-[9px] uppercase mb-1"
          >
            Spots Left
          </p>
          <p style={{ fontFamily: 'var(--font-bebas)' }} className="text-[var(--cream)] text-3xl">
            {spotsRemaining}
          </p>
        </div>
      </div>

      <div
        style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
        className="text-[var(--cream-dim)] text-[10px] uppercase mb-10"
      >
        Draw: {drawDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>

      {liveDrop ? (
        <EntryButton
          dropId={liveDrop.id}
          dropSlug={slug}
          spotsRemaining={spotsRemaining}
          isActive={isActive}
          isLoggedIn={!!user}
        />
      ) : (
        <p
          style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
          className="text-[var(--cream-dim)] text-xs uppercase"
        >
          Drop not yet open
        </p>
      )}
    </main>
  )
}
