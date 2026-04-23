'use client'

import { useEffect, useRef } from 'react'

export default function PagePreloader() {
  const overlayRef      = useRef<HTMLDivElement>(null)
  const fillRef         = useRef<HTMLDivElement>(null)  // wordmark clip container
  const loadingBarRef   = useRef<HTMLDivElement>(null)  // loading bar wrapper (opacity)
  const loadingClipRef  = useRef<HTMLDivElement>(null)  // loading bar clip-path fill
  const accentLineRef   = useRef<HTMLDivElement>(null)
  const taglineRef      = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const overlay     = overlayRef.current
    const fill        = fillRef.current
    const loadingBar  = loadingBarRef.current
    const loadingClip = loadingClipRef.current
    const accentLine  = accentLineRef.current
    const tagline     = taglineRef.current
    if (!overlay || !fill || !loadingBar || !loadingClip || !accentLine || !tagline) return

    const timers: ReturnType<typeof setTimeout>[] = []
    const after = (fn: () => void, ms: number) => { const id = setTimeout(fn, ms); timers.push(id) }

    let completed       = false
    let minTimePassed   = false
    let pendingComplete = false

    const complete = () => {
      if (completed) return
      completed = true
      overlay.style.pointerEvents = 'none'

      // Snap loading bar to 100% then fade it out
      loadingClip.style.transition = 'clip-path 120ms ease-out'
      loadingClip.style.clipPath   = 'inset(0 0% 0 0)'
      after(() => {
        loadingBar.style.transition = 'opacity 180ms ease'
        loadingBar.style.opacity    = '0'
      }, 140)

      // Snap wordmark to 100%
      fill.style.transition = 'clip-path 120ms ease-out'
      fill.style.clipPath   = 'inset(0 0% 0 0)'

      // Accent line expands from center
      after(() => {
        accentLine.style.transition = 'opacity 0.3s ease, transform 0.45s cubic-bezier(0.4,0,0.2,1)'
        accentLine.style.opacity    = '1'
        accentLine.style.transform  = 'scaleX(1)'
      }, 180)

      // Tagline fades in
      after(() => {
        tagline.style.transition = 'opacity 0.3s ease'
        tagline.style.opacity    = '1'
      }, 240)

      // Hold, then fade overlay out
      after(() => {
        overlay.style.transition = 'opacity 520ms ease'
        overlay.style.opacity    = '0'
        after(() => { overlay.style.display = 'none' }, 540)
      }, 860)
    }

    const tryComplete = () => {
      if (minTimePassed) { complete() } else { pendingComplete = true }
    }

    // Phase 1: wordmark fills to 80% over 700ms
    requestAnimationFrame(() => {
      fill.style.transition = 'clip-path 700ms cubic-bezier(0.4, 0, 0.2, 1)'
      fill.style.clipPath   = 'inset(0 20% 0 0)'
    })

    // After 700ms: check if page loaded
    after(() => {
      minTimePassed = true
      if (pendingComplete || document.readyState === 'complete') {
        complete()
      } else {
        // Page not ready — show loading bar filling left to right
        loadingBar.style.transition  = 'opacity 0.25s ease'
        loadingBar.style.opacity     = '1'
        requestAnimationFrame(() => {
          loadingClip.style.transition = 'clip-path 900ms cubic-bezier(0.4, 0, 0.2, 1)'
          loadingClip.style.clipPath   = 'inset(0 20% 0 0)' // fills to 80%, holds until load
        })
      }
    }, 700)

    if (document.readyState === 'complete') {
      tryComplete()
    } else {
      window.addEventListener('load', tryComplete, { once: true })
      after(tryComplete, 7000)
    }

    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('load', tryComplete)
    }
  }, [])

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#080604',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'all',
      }}
    >
      {/* Wordmark + loading bar share the same inline block so bar matches text width */}
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch' }}>

        {/* Wordmark — clip-path fills left to right */}
        <div ref={fillRef} style={{ clipPath: 'inset(0 100% 0 0)', willChange: 'clip-path' }}>
          <span style={{
            fontFamily: 'var(--font-anton)', fontSize: 'clamp(52px, 9vw, 112px)',
            letterSpacing: '0.08em', color: '#f5ede0', display: 'block', lineHeight: 1,
          }}>
            DEDSTOK
          </span>
        </div>

        {/* Loading bar — same clip-path technique, appears while waiting for window.onload */}
        <div ref={loadingBarRef} style={{ height: 3, opacity: 0, marginTop: 10 }}>
          <div ref={loadingClipRef} style={{ height: '100%', background: '#CA8A04', clipPath: 'inset(0 100% 0 0)', willChange: 'clip-path' }} />
        </div>
      </div>

      {/* Gold accent line — expands from center once page is ready */}
      <div ref={accentLineRef} style={{ width: 48, height: 1, background: 'rgba(202,138,4,0.55)', opacity: 0, transform: 'scaleX(0)', transformOrigin: 'center', marginTop: 28, marginBottom: 18 }} />

      {/* Tagline */}
      <div ref={taglineRef} style={{ opacity: 0 }}>
        <span style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: 'clamp(7px, 1vw, 11px)',
          letterSpacing: '0.38em', textTransform: 'uppercase', color: '#CA8A04',
          display: 'block', textAlign: 'center',
        }}>
          One drop. One winner. Every week.
        </span>
      </div>
    </div>
  )
}
