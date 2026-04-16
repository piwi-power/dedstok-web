export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EntryButton from '@/components/EntryButton'

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
      .select('id, item_name, slug, description, entry_price, total_spots, spots_sold, draw_date, market_value, status, image_url, quote, quote_attribution')
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

  // Build stats array — only include market value if set
  const stats = [
    ...(drop.market_value ? [{ label: 'Market Value', value: `$${drop.market_value.toLocaleString()}` }] : []),
    { label: 'Entry', value: `$${drop.entry_price}` },
    { label: 'Odds / Spot', value: `1 in ${drop.total_spots}` },
    { label: 'Spots Left', value: String(spotsRemaining) },
  ]

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '120px' }}>

      {/* Hero image — full content width, no radius */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 32px 0' }}>
        {drop.image_url ? (
          <img
            src={drop.image_url}
            alt={drop.item_name}
            style={{
              width: '100%',
              aspectRatio: '16/9',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            aspectRatio: '16/9',
            background: 'var(--walnut)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.1)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
              No image
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 32px 0' }}>

        {/* Status + title */}
        <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '12px' }}>
          {isActive ? 'Live Drop' : drop.status === 'drawn' ? 'Drawn' : 'Closed'}
        </p>

        <h1 style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontWeight: 700,
          color: 'var(--cream)',
          fontSize: 'clamp(40px, 6vw, 72px)',
          letterSpacing: '0.01em',
          textTransform: 'uppercase',
          lineHeight: 1,
          marginBottom: '32px',
        }}>
          {drop.item_name}
        </h1>

        {/* Stats strip — connected cells, no individual gaps */}
        <div style={{
          display: 'flex',
          border: '1px solid rgba(202,138,4,0.2)',
          marginBottom: '40px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                minWidth: '88px',
                padding: '16px 20px',
                background: 'var(--walnut)',
                borderRight: i < stats.length - 1 ? '1px solid rgba(202,138,4,0.15)' : 'none',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-dm-mono)',
                color: 'rgba(245,237,224,0.35)',
                fontSize: '8px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '6px',
                whiteSpace: 'nowrap',
              }}>
                {stat.label}
              </p>
              <p style={{
                fontFamily: 'var(--font-bebas)',
                color: 'var(--cream)',
                fontSize: '28px',
                lineHeight: 1,
              }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Quote */}
        {drop.quote && (
          <div style={{ marginBottom: '28px', maxWidth: '580px', borderLeft: '2px solid rgba(202,138,4,0.3)', paddingLeft: '20px' }}>
            <p style={{ fontFamily: 'var(--font-jost)', fontStyle: 'italic', color: 'rgba(245,237,224,0.45)', fontSize: '14px', lineHeight: 1.7, marginBottom: '6px' }}>
              &ldquo;{drop.quote}&rdquo;
            </p>
            {drop.quote_attribution && (
              <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.2)', fontSize: '9px', letterSpacing: '0.12em' }}>
                &mdash; {drop.quote_attribution}
              </p>
            )}
          </div>
        )}

        {/* Description */}
        {drop.description && (
          <p style={{ fontFamily: 'var(--font-jost)', color: 'var(--cream-dim)', fontSize: '14px', lineHeight: 1.75, marginBottom: '36px', maxWidth: '560px' }}>
            {drop.description}
          </p>
        )}

        {/* Draw date */}
        <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.3)', fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '28px' }}>
          Draw &mdash; {drawDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>

        {/* Entry section */}
        <EntryButton
          dropId={drop.id}
          dropSlug={slug}
          spotsRemaining={spotsRemaining}
          isActive={isActive}
          isLoggedIn={!!user}
        />

      </div>
    </main>
  )
}
