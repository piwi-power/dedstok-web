'use client'

import { useState } from 'react'

interface Props {
  dropId: string
  dropSlug: string
  spots: number
  code?: string
  entryPrice: number
  itemName: string
  pointsBalance: number
}

export default function EntryConfirm({ dropId, dropSlug, spots, code, entryPrice, itemName, pointsBalance }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [influencerCode, setInfluencerCode] = useState(code ?? '')
  const [pointsSpots, setPointsSpots] = useState(0)

  const pointsPerSpot = entryPrice * 5
  const maxRedeemableSpots = Math.min(spots, Math.floor(pointsBalance / pointsPerSpot))
  const canRedeemPoints = maxRedeemableSpots > 0

  const cashSpots = spots - pointsSpots
  const cashTotal = (entryPrice * cashSpots).toFixed(2)
  const pointsCost = pointsSpots * pointsPerSpot

  async function handleCheckout() {
    setLoading(true)
    setError(null)

    const res = await fetch('/api/enter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drop_id: dropId,
        spots_count: spots,
        points_spots: pointsSpots,
        influencer_code: influencerCode || undefined,
      }),
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      if (res.status === 403 && data.error?.includes('Phone verification')) {
        window.location.href = '/account/verify-phone'
        return
      }
      setError(data.error ?? 'Something went wrong. Try again.')
      setLoading(false)
      return
    }

    window.location.href = data.data.checkout_url
  }

  return (
    <div style={{
      width: '100%',
      background: 'var(--walnut)',
      border: '1px solid rgba(202,138,4,0.2)',
      padding: '40px',
    }}>
      <p style={{
        fontFamily: 'var(--font-dm-mono)',
        color: 'var(--gold)',
        fontSize: '9px',
        letterSpacing: '0.35em',
        textTransform: 'uppercase',
        marginBottom: '20px',
      }}>
        Confirm Entry
      </p>

      <h2 style={{
        fontFamily: 'var(--font-barlow-condensed)',
        fontWeight: 700,
        color: 'var(--cream)',
        fontSize: '28px',
        textTransform: 'uppercase',
        letterSpacing: '0.01em',
        lineHeight: 1,
        marginBottom: '32px',
      }}>
        {itemName}
      </h2>

      {/* Spot breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.45)', fontSize: '13px' }}>Spots</span>
          <span style={{ fontFamily: 'var(--font-jost)', color: 'var(--cream)', fontSize: '13px' }}>{spots}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.45)', fontSize: '13px' }}>Price per spot</span>
          <span style={{ fontFamily: 'var(--font-jost)', color: 'var(--cream)', fontSize: '13px' }}>${entryPrice}</span>
        </div>

        {pointsSpots > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-jost)', color: 'var(--gold)', fontSize: '13px' }}>
              {pointsSpots} spot{pointsSpots > 1 ? 's' : ''} with STOK points
            </span>
            <span style={{ fontFamily: 'var(--font-jost)', color: 'var(--gold)', fontSize: '13px' }}>
              -{pointsCost} pts
            </span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(202,138,4,0.15)', paddingTop: '14px', marginTop: '4px' }}>
          <span style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.45)', fontSize: '13px' }}>Cash total</span>
          <span style={{ fontFamily: 'var(--font-bebas)', color: 'var(--gold)', fontSize: '22px', lineHeight: 1 }}>
            {cashSpots === 0 ? 'FREE' : `$${cashTotal}`}
          </span>
        </div>
      </div>

      {/* Points redemption */}
      {canRedeemPoints && (
        <div style={{
          background: 'rgba(202,138,4,0.06)',
          border: '1px solid rgba(202,138,4,0.2)',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              STOK Points
            </p>
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: 'rgba(245,237,224,0.5)' }}>
              {pointsBalance} pts available
            </p>
          </div>
          <p style={{ fontFamily: 'var(--font-jost)', fontSize: '12px', color: 'rgba(245,237,224,0.4)', marginBottom: '16px' }}>
            {pointsPerSpot} points = 1 free spot
          </p>

          <div style={{ display: 'flex', gap: '8px' }}>
            {Array.from({ length: maxRedeemableSpots }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPointsSpots(pointsSpots === n ? 0 : n)}
                style={{
                  flex: 1,
                  background: pointsSpots === n ? 'var(--gold)' : 'rgba(202,138,4,0.1)',
                  color: pointsSpots === n ? '#0c0a09' : 'var(--gold)',
                  border: `1px solid ${pointsSpots === n ? 'var(--gold)' : 'rgba(202,138,4,0.3)'}`,
                  padding: '10px',
                  fontFamily: 'var(--font-dm-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {n} spot{n > 1 ? 's' : ''}
              </button>
            ))}
            {pointsSpots > 0 && (
              <button
                onClick={() => setPointsSpots(0)}
                style={{
                  background: 'transparent',
                  color: 'rgba(245,237,224,0.35)',
                  border: '1px solid rgba(245,237,224,0.1)',
                  padding: '10px 14px',
                  fontFamily: 'var(--font-dm-mono)',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            )}
          </div>

          {pointsSpots > 0 && (
            <p style={{ fontFamily: 'var(--font-jost)', fontSize: '11px', color: 'rgba(202,138,4,0.6)', marginTop: '14px', lineHeight: 1.5 }}>
              Heads up: redeeming points reduces your rank on this month&apos;s leaderboard. The monthly #1 earns 2x tickets in the next drop.
            </p>
          )}
        </div>
      )}

      {/* Influencer code */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{
          fontFamily: 'var(--font-dm-mono)',
          color: 'rgba(245,237,224,0.35)',
          fontSize: '9px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: '10px',
        }}>
          Influencer Code (optional)
        </label>
        <input
          type="text"
          value={influencerCode}
          onChange={(e) => setInfluencerCode(e.target.value.toUpperCase())}
          placeholder="CODE"
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid rgba(202,138,4,0.2)',
            color: 'var(--cream)',
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '13px',
            padding: '12px 14px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {error && (
        <p style={{ fontFamily: 'var(--font-jost)', color: '#ef4444', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>
          {error}
        </p>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading}
        style={{
          width: '100%',
          background: loading ? 'rgba(202,138,4,0.5)' : 'var(--gold)',
          color: '#0c0a09',
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '9px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          padding: '18px',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'opacity 150ms',
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
      >
        {loading
          ? 'Processing...'
          : cashSpots === 0
          ? `Redeem ${pointsCost} STOK Points`
          : `Proceed to Payment — $${cashTotal}`}
      </button>

      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.2)', fontSize: '10px', textAlign: 'center', marginTop: '16px' }}>
        {cashSpots === 0 ? 'No payment required. Entry is free with your points.' : 'Powered by Stripe. No refunds after draw.'}
      </p>
    </div>
  )
}
