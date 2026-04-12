export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EntryButton from '@/components/EntryButton'
import BackButton from '@/components/BackButton'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: drop } = await supabase
    .from('drops')
    .select('item_name, description')
    .eq('slug', slug)
    .single()
  if (!drop) return { title: 'Drop Not Found' }
  return {
    title: drop.item_name,
    description: drop.description ?? undefined,
  }
}

export default async function DropPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const [dropResult, userResult] = await Promise.all([
    supabase
      .from('drops')
      .select('id, item_name, slug, description, entry_price, total_spots, spots_sold, draw_date, market_value, status, image_url')
      .eq('slug', slug)
      .single(),
    supabase.auth.getUser(),
  ])

  const drop = dropResult.data
  if (!drop) notFound()

  const user = userResult.data.user
  const spotsRemaining = drop.total_spots - drop.spots_sold
  const isActive = drop.status === 'active'
  const drawDate = new Date(drop.draw_date)

  return (
    <main className="min-h-screen px-6 py-24 max-w-4xl mx-auto">
      <BackButton href="/drops" />

      {drop.image_url && (
        <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '4px', marginBottom: '40px', background: 'rgba(245,237,224,0.03)' }}>
          <img
            src={drop.image_url}
            alt={drop.item_name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

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

      {drop.description && (
        <p className="text-[var(--cream-dim)] mb-10 max-w-xl">{drop.description}</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 max-w-2xl">
        {drop.market_value && (
          <div className="bg-[var(--walnut)] border border-[var(--gold-dim)] p-4 rounded">
            <p
              style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
              className="text-[var(--gold)] text-[9px] uppercase mb-1"
            >
              Market Value
            </p>
            <p style={{ fontFamily: 'var(--font-bebas)' }} className="text-[var(--cream)] text-3xl">
              ${drop.market_value.toLocaleString()}
            </p>
          </div>
        )}

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

      <EntryButton
        dropId={drop.id}
        dropSlug={slug}
        spotsRemaining={spotsRemaining}
        isActive={isActive}
        isLoggedIn={!!user}
      />
    </main>
  )
}
