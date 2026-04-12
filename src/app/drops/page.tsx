export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Current Drop',
  description: "This week's drop. One item. One winner.",
}

export default async function DropsPage() {
  const supabase = await createClient()

  const { data: drop } = await supabase
    .from('drops')
    .select('id, item_name, slug, description, entry_price, total_spots, spots_sold, draw_date, market_value, image_url, status')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <main style={{ minHeight: '100vh', padding: '60px 24px', maxWidth: '900px', margin: '0 auto' }}>
      <p style={{ color: '#CA8A04', fontFamily: 'sans-serif', fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '16px' }}>
        This Week
      </p>
      <h1 style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '40px', fontWeight: 700, marginBottom: '48px' }}>
        Current Drop
      </h1>

      {!drop ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', border: '1px solid rgba(202,138,4,0.2)', borderRadius: '4px' }}>
          <p style={{ color: 'rgba(245,237,224,0.4)', fontFamily: 'sans-serif', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Next drop revealed Sunday.
          </p>
        </div>
      ) : (
        <Link href={`/drops/${drop.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ border: '1px solid rgba(202,138,4,0.25)', borderRadius: '4px', overflow: 'hidden', transition: 'border-color 0.15s' }}>
            {drop.image_url && (
              <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: 'rgba(245,237,224,0.03)' }}>
                <img
                  src={drop.image_url}
                  alt={drop.item_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}
            <div style={{ padding: '40px' }}>
              <p style={{ color: '#CA8A04', fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Live Now
              </p>
              <h2 style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
                {drop.item_name}
              </h2>
              {drop.description && (
                <p style={{ color: 'rgba(245,237,224,0.55)', fontFamily: 'sans-serif', fontSize: '14px', lineHeight: 1.6, marginBottom: '32px' }}>
                  {drop.description}
                </p>
              )}
              <div style={{ display: 'flex', gap: '32px' }}>
                <div>
                  <p style={{ color: 'rgba(245,237,224,0.35)', fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>Entry</p>
                  <p style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '18px', fontWeight: 700 }}>${drop.entry_price}</p>
                </div>
                <div>
                  <p style={{ color: 'rgba(245,237,224,0.35)', fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>Draw</p>
                  <p style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '18px', fontWeight: 700 }}>
                    {new Date(drop.draw_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p style={{ color: 'rgba(245,237,224,0.35)', fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>Spots Left</p>
                  <p style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '18px', fontWeight: 700 }}>
                    {drop.total_spots - drop.spots_sold}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}
    </main>
  )
}
