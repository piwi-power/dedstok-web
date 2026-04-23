'use client'

import { useEffect, useRef } from 'react'

export default function PagePreloader() {
  const overlayRef    = useRef<HTMLDivElement>(null)
  const fillRef       = useRef<HTMLDivElement>(null)
  const loadingBarRef = useRef<HTMLDivElement>(null)
  const accentLineRef = useRef<HTMLDivElement>(null)
  const taglineRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const overlay    = overlayRef.current
    const fill       = fillRef.current
    const loadingBar = loadingBarRef.current
    const accentLine = accentLineRef.current
    const tagline    = taglineRef.current
    if (!overlay || !fill || !loadingBar || !accentLine || !tagline) return

    const timers: ReturnType<typeof setTimeout>[] = []
    const after = (fn: () => void, ms: number) => { const id = setTimeout(fn, ms); timers.push(id) }

    let rafId: number | null = null
    let t = 0

    const startLoadingAnim = () => {
      const tick = () => {
        t += 0.04
        loadingBar.style.transform = `translateX(${Math.sin(t) * 26}px)`
        rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)
    }
    const stopLoadingAnim = () => {
      if (rafId != null) { cancelAnimationFrame(rafId); rafId = null }
    }

    let completed = false
    let minTimePassed = false  // becomes true after 700ms fill animation
    let pendingComplete = false

    const complete = () => {
      if (completed) return
      completed = true
      stopLoadingAnim()

      // Allow pointer events through (page is loading/loaded, overlay fading out)
      overlay.style.pointerEvents = 'none'

      // Dismiss loading bar
      loadingBar.style.transition = 'opacity 0.2s ease'
      loadingBar.style.opacity = '0'
      loadingBar.style.transform = 'translateX(0)'

      // Snap wordmark to 100%
      fill.style.transition = 'clip-path 150ms ease-out'
      fill.style.clipPath = 'inset(0 0% 0 0)'

      // Accent line expands from center
      after(() => {
        accentLine.style.transition = 'opacity 0.3s ease, transform 0.45s cubic-bezier(0.4,0,0.2,1)'
        accentLine.style.opacity   = '1'
        accentLine.style.transform = 'scaleX(1)'
      }, 160)

      // Tagline fades in
      after(() => {
        tagline.style.transition = 'opacity 0.3s ease'
        tagline.style.opacity = '1'
      }, 220)

      // Hold, then fade overlay out
      after(() => {
        overlay.style.transition = 'opacity 520ms ease'
        overlay.style.opacity = '0'
        after(() => { overlay.style.display = 'none' }, 540)
      }, 800)
    }

    const tryComplete = () => {
      if (minTimePassed) {
        complete()
      } else {
        // Page loaded before 700ms fill — fire complete immediately at 700ms
        pendingComplete = true
      }
    }

    // Phase 1: fill wordmark to 80% over 700ms
    requestAnimationFrame(() => {
      fill.style.transition = 'clip-path 700ms cubic-bezier(0.4, 0, 0.2, 1)'
      fill.style.clipPath = 'inset(0 20% 0 0)'
    })

    // After 700ms: check if page loaded
    after(() => {
      minTimePassed = true
      if (pendingComplete || document.readyState === 'complete') {
        complete()
      } else {
        // Show loading indicator while page finishes
        loadingBar.style.transition = 'opacity 0.3s ease'
        loadingBar.style.opacity = '1'
        startLoadingAnim()
      }
    }, 700)

    // Listen for page load
    if (document.readyState === 'complete') {
      tryComplete()
    } else {
      window.addEventListener('load', tryComplete, { once: true })
      // 7s hard fallback
      after(tryComplete, 7000)
    }

    return () => {
      timers.forEach(clearTimeout)
      stopLoadingAnim()
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
      {/* Wordmark — clip-path reveals left to right, no ghost outline */}
      <div ref={fillRef} style={{ clipPath: 'inset(0 100% 0 0)', willChange: 'clip-path' }}>
        <span style={{ fontFamily: 'var(--font-anton)', fontSize: 'clamp(52px, 9vw, 112px)', letterSpacing: '0.08em', color: '#f5ede0', display: 'block', lineHeight: 1 }}>
          DEDSTOK
        </span>
      </div>

      {/* Loading bar — oscillates while page is loading */}
      <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div ref={loadingBarRef} style={{ width: 36, height: 2, background: '#CA8A04', opacity: 0, transformOrigin: 'center', transform: 'translateX(0)' }} />
      </div>

      {/* Gold accent line — appears when page is ready */}
      <div ref={accentLineRef} style={{ width: 48, height: 1, background: 'rgba(202,138,4,0.55)', opacity: 0, transform: 'scaleX(0)', transformOrigin: 'center', marginBottom: 20 }} />

      {/* Tagline — fades in alongside accent line */}
      <div ref={taglineRef} style={{ opacity: 0 }}>
        <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 'clamp(7px, 1vw, 11px)', letterSpacing: '0.38em', textTransform: 'uppercase', color: '#CA8A04', display: 'block', textAlign: 'center' }}>
          One drop. One winner. Every week.
        </span>
      </div>
    </div>
  )
}
