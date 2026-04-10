'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  dropId: string
  dropSlug: string
  spotsRemaining: number
  isActive: boolean
  isLoggedIn: boolean
}

export default function EntryButton({ dropId, dropSlug, spotsRemaining, isActive, isLoggedIn }: Props) {
  const router = useRouter()
  const [spots, setSpots] = useState(1)

  if (!isActive || spotsRemaining === 0) {
    return (
      <button
        disabled
        style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
        className="bg-[var(--walnut)] border border-[var(--gold-dim)] text-[var(--cream-dim)] text-xs uppercase px-8 py-4 rounded-full opacity-50 cursor-not-allowed"
      >
        {spotsRemaining === 0 ? 'Sold Out' : 'Drop Closed'}
      </button>
    )
  }

  function handleEnter() {
    if (!isLoggedIn) {
      router.push(`/?auth=required&next=/enter?drop=${dropSlug}&spots=${spots}&id=${dropId}`)
      return
    }
    router.push(`/enter?drop=${dropSlug}&spots=${spots}&id=${dropId}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span
          style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
          className="text-[var(--gold)] text-[10px] uppercase"
        >
          Spots
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSpots(Math.max(1, spots - 1))}
            className="w-8 h-8 border border-[var(--gold-dim)] text-[var(--cream)] rounded hover:border-[var(--gold)] transition-colors"
          >
            -
          </button>
          <span
            style={{ fontFamily: 'var(--font-bebas)' }}
            className="text-[var(--cream)] text-2xl w-6 text-center"
          >
            {spots}
          </span>
          <button
            onClick={() => setSpots(Math.min(2, spots + 1))}
            className="w-8 h-8 border border-[var(--gold-dim)] text-[var(--cream)] rounded hover:border-[var(--gold)] transition-colors"
          >
            +
          </button>
        </div>
        <span
          style={{ fontFamily: 'var(--font-dm-mono)' }}
          className="text-[var(--cream-dim)] text-[10px]"
        >
          max 2
        </span>
      </div>

      <button
        onClick={handleEnter}
        style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
        className="bg-[var(--gold)] hover:bg-[var(--gold-light)] text-[var(--bg)] text-xs uppercase px-8 py-4 rounded-full transition-colors"
      >
        Enter the Raffle
      </button>
    </div>
  )
}
