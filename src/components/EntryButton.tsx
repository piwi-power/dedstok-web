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
        style={{
          fontFamily: 'var(--font-dm-mono)',
          letterSpacing: '0.2em',
          fontSize: '9px',
          textTransform: 'uppercase',
          color: 'var(--cream-dim)',
          background: 'var(--walnut)',
          border: '1px solid var(--gold-dim)',
          padding: '16px 40px',
          opacity: 0.5,
          cursor: 'not-allowed',
        }}
      >
        {spotsRemaining === 0 ? 'Sold Out' : 'Drop Closed'}
      </button>
    )
  }

  function handleEnter() {
    if (!isLoggedIn) {
      router.push(`/login?next=/enter?drop=${dropSlug}&spots=${spots}&id=${dropId}`)
      return
    }
    router.push(`/enter?drop=${dropSlug}&spots=${spots}&id=${dropId}`)
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '16px' }}>

      {/* Spots stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{
          fontFamily: 'var(--font-dm-mono)',
          color: 'var(--gold)',
          fontSize: '9px',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
        }}>
          Spots
        </span>

        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(202,138,4,0.25)' }}>
          <button
            onClick={() => setSpots(Math.max(1, spots - 1))}
            style={{
              width: '40px',
              height: '40px',
              background: 'none',
              border: 'none',
              borderRight: '1px solid rgba(202,138,4,0.2)',
              color: 'var(--cream)',
              cursor: 'pointer',
              fontSize: '18px',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 150ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,237,224,0.04)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            −
          </button>
          <span style={{
            fontFamily: 'var(--font-bebas)',
            color: 'var(--cream)',
            fontSize: '24px',
            width: '48px',
            textAlign: 'center',
            lineHeight: 1,
            paddingTop: '2px',
          }}>
            {spots}
          </span>
          <button
            onClick={() => setSpots(Math.min(2, spots + 1))}
            style={{
              width: '40px',
              height: '40px',
              background: 'none',
              border: 'none',
              borderLeft: '1px solid rgba(202,138,4,0.2)',
              color: 'var(--cream)',
              cursor: 'pointer',
              fontSize: '18px',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 150ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,237,224,0.04)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            +
          </button>
        </div>

        <span style={{
          fontFamily: 'var(--font-dm-mono)',
          color: 'rgba(245,237,224,0.2)',
          fontSize: '9px',
          letterSpacing: '0.15em',
        }}>
          max 2
        </span>
      </div>

      {/* Enter button */}
      <button
        onClick={handleEnter}
        style={{
          fontFamily: 'var(--font-dm-mono)',
          letterSpacing: '0.22em',
          color: 'var(--bg)',
          background: 'var(--gold)',
          fontSize: '9px',
          textTransform: 'uppercase',
          padding: '16px 40px',
          border: 'none',
          cursor: 'pointer',
          width: '100%',
          transition: 'opacity 150ms',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        Enter the Drop
      </button>

    </div>
  )
}
