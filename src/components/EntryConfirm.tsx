'use client'

import { useState } from 'react'

interface Props {
  dropId: string
  dropSlug: string
  spots: number
  code?: string
  entryPrice: number
  itemName: string
}

export default function EntryConfirm({ dropId, dropSlug, spots, code, entryPrice, itemName }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [influencerCode, setInfluencerCode] = useState(code ?? '')

  async function handleCheckout() {
    setLoading(true)
    setError(null)

    const res = await fetch('/api/enter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drop_id: dropId,
        spots_count: spots,
        influencer_code: influencerCode || undefined,
      }),
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      setError(data.error ?? 'Something went wrong. Try again.')
      setLoading(false)
      return
    }

    window.location.href = data.data.checkout_url
  }

  const total = (entryPrice * spots).toFixed(2)

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

      <div className="space-y-3 mb-6 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--cream-dim)]">Spots</span>
          <span className="text-[var(--cream)]">{spots}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--cream-dim)]">Price per spot</span>
          <span className="text-[var(--cream)]">${entryPrice}</span>
        </div>
        <div className="flex justify-between border-t border-[var(--gold-dim)] pt-3">
          <span className="text-[var(--cream-dim)]">Total</span>
          <span
            style={{ fontFamily: 'var(--font-bebas)' }}
            className="text-[var(--gold)] text-xl"
          >
            ${total}
          </span>
        </div>
      </div>

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
        {loading ? 'Redirecting to payment...' : 'Proceed to Payment'}
      </button>

      <p
        style={{ fontFamily: 'var(--font-dm-mono)' }}
        className="text-[var(--cream-dim)] text-[10px] text-center mt-4"
      >
        Powered by Stripe. No refunds after draw.
      </p>
    </div>
  )
}
