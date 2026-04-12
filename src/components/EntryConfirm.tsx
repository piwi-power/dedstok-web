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

  // Points cost per spot at 5:1 rate
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
    <div className="max-w-md w-full bg-[var(--walnut)] border border-[var(--gold-dim)] rounded p-8">
      <p
        style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.3em' }}
        className="text-[var(--gold)] text-[10px] uppercase mb-6"
      >
        Confirm Entry
      </p>

      <h2
        style={{ fontFamily: 'var(--font-serif)' }}
        className="text-[var(--cream)] text-2xl font-bold mb-6"
      >
        {itemName}
      </h2>

      {/* Spot breakdown */}
      <div className="space-y-3 mb-6 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--cream-dim)]">Spots</span>
          <span className="text-[var(--cream)]">{spots}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--cream-dim)]">Price per spot</span>
          <span className="text-[var(--cream)]">${entryPrice}</span>
        </div>

        {pointsSpots > 0 && (
          <div className="flex justify-between text-[var(--gold)]">
            <span>{pointsSpots} spot{pointsSpots > 1 ? 's' : ''} with STOK points</span>
            <span>-{pointsCost} pts</span>
          </div>
        )}

        <div className="flex justify-between border-t border-[var(--gold-dim)] pt-3">
          <span className="text-[var(--cream-dim)]">Cash total</span>
          <span
            style={{ fontFamily: 'var(--font-bebas)' }}
            className="text-[var(--gold)] text-xl"
          >
            {cashSpots === 0 ? 'FREE' : `$${cashTotal}`}
          </span>
        </div>
      </div>

      {/* Points redemption */}
      {canRedeemPoints && (
        <div style={{ background: 'rgba(202,138,4,0.06)', border: '1px solid rgba(202,138,4,0.2)', borderRadius: '4px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ fontFamily: 'sans-serif', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#CA8A04' }}>
              STOK Points
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: '12px', color: 'rgba(245,237,224,0.6)' }}>
              {pointsBalance} pts available
            </p>
          </div>
          <p style={{ fontFamily: 'sans-serif', fontSize: '12px', color: 'rgba(245,237,224,0.45)', marginBottom: '12px' }}>
            {pointsPerSpot} points = 1 free spot
          </p>

          <div style={{ display: 'flex', gap: '8px' }}>
            {Array.from({ length: maxRedeemableSpots }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPointsSpots(pointsSpots === n ? 0 : n)}
                style={{
                  flex: 1,
                  background: pointsSpots === n ? '#CA8A04' : 'rgba(202,138,4,0.1)',
                  color: pointsSpots === n ? '#0c0a09' : '#CA8A04',
                  border: `1px solid ${pointsSpots === n ? '#CA8A04' : 'rgba(202,138,4,0.3)'}`,
                  borderRadius: '4px',
                  padding: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'sans-serif',
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
                  borderRadius: '4px',
                  padding: '8px 12px',
                  fontSize: '11px',
                  fontFamily: 'sans-serif',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Influencer code */}
      <div className="mb-6">
        <label
          style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
          className="text-[var(--cream-dim)] text-[10px] uppercase block mb-2"
        >
          Influencer Code (optional)
        </label>
        <input
          type="text"
          value={influencerCode}
          onChange={(e) => setInfluencerCode(e.target.value.toUpperCase())}
          placeholder="CODE"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
          className="w-full bg-transparent border border-[var(--gold-dim)] text-[var(--cream)] placeholder-[var(--cream-dim)] px-4 py-2 text-sm rounded focus:outline-none focus:border-[var(--gold)] transition-colors"
        />
      </div>

      {error && (
        <p className="text-red-400 text-xs mb-4 text-center">{error}</p>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading}
        style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
        className="w-full bg-[var(--gold)] hover:bg-[var(--gold-light)] disabled:opacity-50 text-[var(--bg)] text-xs uppercase py-4 rounded-full transition-colors"
      >
        {loading
          ? 'Processing...'
          : cashSpots === 0
          ? `Redeem ${pointsCost} STOK Points`
          : `Proceed to Payment — $${cashTotal}`}
      </button>

      <p
        style={{ fontFamily: 'var(--font-dm-mono)' }}
        className="text-[var(--cream-dim)] text-[10px] text-center mt-4"
      >
        {cashSpots === 0 ? 'No payment required. Entry is free with your points.' : 'Powered by Stripe. No refunds after draw.'}
      </p>
    </div>
  )
}
