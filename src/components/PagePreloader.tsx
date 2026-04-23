'use client'

import { useEffect, useRef } from 'react'

export default function PagePreloader() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const overlay = overlayRef.current
    const fill = fillRef.current
    const tagline = taglineRef.current
    if (!overlay || !fill || !tagline) return

    const timers: ReturnType<typeof setTimeout>[] = []
    const after = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms)
      timers.push(id)
      return id
    }

    let completed = false

    const complete = () => {
      if (completed) return
      completed = true

      // Allow clicks through while fading out
      overlay.style.pointerEvents = 'none'

      // Snap wordmark to 100%
      fill.style.transition = 'clip-path 150ms ease-out'
      fill.style.clipPath = 'inset(0 0% 0 0)'

      // Tagline fades in after wordmark completes
      after(() => {
        tagline.style.transition = 'opacity 300ms ease'
        tagline.style.opacity = '1'
      }, 200)

      // Overlay fades out — hold 600ms so tagline registers, then fade
      after(() => {
        overlay.style.transition = 'opacity 520ms ease'
        overlay.style.opacity = '0'
        // Remove from flow after fade
        after(() => {
          overlay.style.display = 'none'
        }, 540)
      }, 650)
    }

    // Phase 1: reveal wordmark to 80% — starts on next frame so initial state is painted
    requestAnimationFrame(() => {
      fill.style.transition = 'clip-path 700ms cubic-bezier(0.4, 0, 0.2, 1)'
      fill.style.clipPath = 'inset(0 20% 0 0)'
    })

    // Phase 2: hold at 80% until window.onload, then complete
    if (document.readyState === 'complete') {
      after(complete, 300)
    } else {
      window.addEventListener('load', complete, { once: true })
      // Safety fallback — never hang longer than 6s
      after(complete, 6000)
    }

    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('load', complete)
    }
  }, [])

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#080604',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '18px',
        pointerEvents: 'all',
      }}
    >
      {/* Wordmark — clip-path reveals left to right, no ghost outline */}
      <div
        ref={fillRef}
        style={{
          clipPath: 'inset(0 100% 0 0)',
          willChange: 'clip-path',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-anton)',
            fontSize: 'clamp(52px, 9vw, 112px)',
            letterSpacing: '0.08em',
            color: '#f5ede0',
            display: 'block',
            lineHeight: 1,
          }}
        >
          DEDSTOK
        </span>
      </div>

      {/* Tagline — fades in once wordmark is 100% */}
      <div
        ref={taglineRef}
        style={{ opacity: 0, willChange: 'opacity' }}
      >
        <span
          style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: 'clamp(7px, 1vw, 11px)',
            letterSpacing: '0.38em',
            textTransform: 'uppercase',
            color: '#CA8A04',
            display: 'block',
            textAlign: 'center',
          }}
        >
          One drop. One winner. Every week.
        </span>
      </div>
    </div>
  )
}
