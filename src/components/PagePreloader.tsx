'use client'

import { useEffect, useRef } from 'react'

export default function PagePreloader() {
  const overlayRef    = useRef<HTMLDivElement>(null)
  const fillRef       = useRef<HTMLDivElement>(null)
  const accentLineRef = useRef<HTMLDivElement>(null)
  const taglineRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const overlay    = overlayRef.current
    const fill       = fillRef.current
    const accentLine = accentLineRef.current
    const tagline    = taglineRef.current
    if (!overlay || !fill || !accentLine || !tagline) return

    const timers: ReturnType<typeof setTimeout>[] = []
    let pulseInterval: ReturnType<typeof setInterval> | null = null
    const after = (fn: () => void, ms: number) => { const id = setTimeout(fn, ms); timers.push(id) }

    let finished   = false
    let pageLoaded = false
    let lineOpen   = false

    // ── Pulse: compress → expand loop while page loads ──────────────────────
    const startPulse = () => {
      let expanding = false // first step is compress
      const step = () => {
        accentLine.style.transition = 'width 480ms cubic-bezier(0.4, 0, 0.2, 1)'
        accentLine.style.width = expanding ? '100%' : '0%'
        expanding = !expanding
      }
      pulseInterval = setInterval(step, 580)
    }

    const stopPulse = (then: () => void) => {
      if (pulseInterval) { clearInterval(pulseInterval); pulseInterval = null }
      accentLine.style.transition = 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)'
      accentLine.style.width = '100%'
      setTimeout(then, 320)
    }

    // ── Finish: tagline → hold → fade out ───────────────────────────────────
    const finish = () => {
      if (finished) return
      finished = true
      overlay.style.pointerEvents = 'none'

      tagline.style.transition = 'opacity 0.35s ease'
      tagline.style.opacity = '1'

      after(() => {
        overlay.style.transition = 'opacity 520ms ease'
        overlay.style.opacity = '0'
        after(() => { overlay.style.display = 'none' }, 540)
      }, 860)
    }

    // ── Page load signal ─────────────────────────────────────────────────────
    const onLoaded = () => {
      pageLoaded = true
      if (lineOpen) {
        // Pulse is running (or just started) — stop cleanly then finish
        stopPulse(finish)
      }
      // If lineOpen is still false, the after(500) callback will see
      // pageLoaded === true and call finish() directly (no pulse needed)
    }

    // ── Phase 1: DEDSTOK fills 0 → 100% over 700ms ──────────────────────────
    requestAnimationFrame(() => {
      fill.style.transition = 'clip-path 700ms cubic-bezier(0.4, 0, 0.2, 1)'
      fill.style.clipPath = 'inset(0 0% 0 0)'
    })

    // ── Phase 2: Gold line expands left to right (starts at 700ms) ──────────
    after(() => {
      accentLine.style.transition = 'width 480ms cubic-bezier(0.4, 0, 0.2, 1)'
      accentLine.style.width = '100%'

      // After line fully open: check load state
      after(() => {
        lineOpen = true
        if (pageLoaded) {
          finish()
        } else {
          startPulse()
        }
      }, 500)
    }, 700)

    // 7s safety so we never get stuck
    after(() => { if (!finished) onLoaded() }, 7000)

    if (document.readyState === 'complete') {
      onLoaded()
    } else {
      window.addEventListener('load', onLoaded, { once: true })
    }

    return () => {
      timers.forEach(clearTimeout)
      if (pulseInterval) clearInterval(pulseInterval)
      window.removeEventListener('load', onLoaded)
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
      {/* Wordmark — clip-path fills left to right */}
      <div ref={fillRef} style={{ clipPath: 'inset(0 100% 0 0)', willChange: 'clip-path' }}>
        <span style={{
          fontFamily: 'var(--font-anton)', fontSize: 'clamp(52px, 9vw, 112px)',
          letterSpacing: '0.08em', color: '#f5ede0', display: 'block', lineHeight: 1,
        }}>
          DEDSTOK
        </span>
      </div>

      {/* Gold gradient line — width pulses left-to-right while loading */}
      <div style={{ width: '100%', maxWidth: '480px', marginTop: 28, marginBottom: 18, overflow: 'hidden' }}>
        <div ref={accentLineRef} style={{
          height: 1,
          width: '0%',
          background: 'linear-gradient(to right, rgba(202,138,4,0.15), rgba(202,138,4,0.75))',
        }} />
      </div>

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
