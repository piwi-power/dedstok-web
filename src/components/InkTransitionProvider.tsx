'use client'

import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface PlayInkOpts {
  label?:         string   // Destination room name (room-to-room nav)
  waitForNav?:    boolean  // Hold until pathname changes
  showPreloader?: boolean  // Show full DEDSTOK animation (page nav)
}

interface InkCtx {
  playInk: (x: number, y: number, onCovered: () => void, opts?: PlayInkOpts) => void
}

const InkContext = createContext<InkCtx>({ playInk: () => {} })
export const useInkTransition = () => useContext(InkContext)

export default function InkTransitionProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)

  const circleRef      = useRef<HTMLDivElement>(null)

  // Room label
  const roomWrapRef    = useRef<HTMLDivElement>(null)
  const roomNameRef    = useRef<HTMLSpanElement>(null)

  // Page preloader content
  const pageWrapRef    = useRef<HTMLDivElement>(null)
  const wordmarkRef    = useRef<HTMLDivElement>(null)
  const accentLineRef  = useRef<HTMLDivElement>(null)
  const taglineRef     = useRef<HTMLDivElement>(null)

  const timers      = useRef<ReturnType<typeof setTimeout>[]>([])
  const contractRef = useRef<(() => void) | null>(null)

  const pathname = usePathname()
  const prevPath = useRef(pathname)

  function clearTimers() { timers.current.forEach(clearTimeout); timers.current = [] }
  function after(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms); timers.current.push(id); return id
  }

  // Pathname change → new page mounted → fire pending contract
  useEffect(() => {
    if (pathname === prevPath.current) return
    prevPath.current = pathname
    const fn = contractRef.current
    if (!fn) return
    contractRef.current = null
    setTimeout(fn, 200)
  }, [pathname])

  const playInk = useCallback((
    x: number,
    y: number,
    onCovered: () => void,
    opts: PlayInkOpts = {},
  ) => {
    const { label, waitForNav, showPreloader } = opts
    const circle     = circleRef.current
    const roomWrap   = roomWrapRef.current
    const roomName   = roomNameRef.current
    const pageWrap   = pageWrapRef.current
    const wordmark   = wordmarkRef.current
    const accentLine = accentLineRef.current
    const tagline    = taglineRef.current
    if (!circle) return

    clearTimers()
    contractRef.current = null

    // ── Reset all overlay content ──────────────────────────────────────────────
    const hide = (el: HTMLElement | null) => { if (el) { el.style.transition = 'none'; el.style.opacity = '0' } }
    hide(roomWrap)
    hide(pageWrap)
    hide(tagline)
    if (wordmark)    { wordmark.style.transition   = 'none'; wordmark.style.clipPath = 'inset(0 100% 0 0)' }
    if (accentLine)  { accentLine.style.transition = 'none'; accentLine.style.width  = '0%' }

    // ── Reset circle ───────────────────────────────────────────────────────────
    const maxR = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) * 2.6
    circle.style.transition = 'none'
    circle.style.left    = x + 'px'
    circle.style.top     = y + 'px'
    circle.style.width   = '0px'
    circle.style.height  = '0px'
    circle.style.opacity = '1'

    if (label && roomName) roomName.textContent = label
    setVisible(true)

    requestAnimationFrame(() => {
      circle.style.transition = 'width 0.62s cubic-bezier(0.4,0,0.2,1), height 0.62s cubic-bezier(0.4,0,0.2,1)'
      circle.style.width  = maxR + 'px'
      circle.style.height = maxR + 'px'

      after(() => {
        onCovered()

        // ── A. PAGE TRANSITION — full DEDSTOK preloader ───────────────────────
        if (showPreloader && waitForNav && pageWrap && wordmark && accentLine && tagline) {
          pageWrap.style.opacity = '1'

          // Local state for this transition
          let navDone = false
          let lineOpen = false
          let navPulseInterval: ReturnType<typeof setInterval> | null = null

          const startPulse = () => {
            let expanding = false // first step is compress
            const step = () => {
              accentLine.style.transition = 'width 480ms cubic-bezier(0.4, 0, 0.2, 1)'
              accentLine.style.width = expanding ? '100%' : '0%'
              expanding = !expanding
            }
            navPulseInterval = setInterval(step, 580)
          }

          const stopPulse = (then: () => void) => {
            if (navPulseInterval) { clearInterval(navPulseInterval); navPulseInterval = null }
            accentLine.style.transition = 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)'
            accentLine.style.width = '100%'
            setTimeout(then, 320)
          }

          const contractCircle = () => {
            after(() => {
              circle.style.transition = 'width 0.52s cubic-bezier(0.4,0,0.8,1), height 0.52s cubic-bezier(0.4,0,0.8,1), opacity 0.52s ease'
              circle.style.width   = '0px'
              circle.style.height  = '0px'
              circle.style.opacity = '0'
              after(() => setVisible(false), 540)
            }, 180)
          }

          const doFinish = () => {
            if (navDone) return
            navDone = true

            // Snap wordmark to 100%
            wordmark.style.transition = 'clip-path 120ms ease-out'
            wordmark.style.clipPath   = 'inset(0 0% 0 0)'

            // Tagline
            after(() => {
              tagline.style.transition = 'opacity 0.3s ease'
              tagline.style.opacity    = '1'
            }, 160)

            // Hold then contract
            after(() => {
              pageWrap.style.transition = 'opacity 0.2s ease'
              pageWrap.style.opacity    = '0'
              contractCircle()
            }, 800)
          }

          // finishAndOpen: called when pathname changes (new page mounted)
          // If pulse is running, stop it cleanly first; else finish directly
          const finishAndOpen = () => {
            if (navPulseInterval) {
              stopPulse(doFinish)
            } else if (lineOpen) {
              doFinish()
            } else {
              // Nav completed before line finished expanding — mark navDone,
              // the after(500) below will call doFinish directly
              navDone = false // reset so doFinish can run
              doFinish()
            }
          }

          contractRef.current = finishAndOpen

          // Phase 1: DEDSTOK fills 0 → 100% over 700ms
          requestAnimationFrame(() => {
            wordmark.style.transition = 'clip-path 700ms cubic-bezier(0.4, 0, 0.2, 1)'
            wordmark.style.clipPath   = 'inset(0 0% 0 0)'
          })

          // Phase 2: Gold line expands left to right (700ms after start)
          after(() => {
            accentLine.style.transition = 'width 480ms cubic-bezier(0.4, 0, 0.2, 1)'
            accentLine.style.width = '100%'

            after(() => {
              lineOpen = true
              if (navDone) {
                doFinish()
              } else {
                startPulse()
              }
            }, 500)
          }, 700)

          // 6s safety
          after(() => {
            if (contractRef.current) {
              contractRef.current = null
              if (navPulseInterval) { stopPulse(doFinish) } else { doFinish() }
            }
          }, 6000)

        // ── B. ROOM TRANSITION — destination name in Anton, large, longer hold ─
        } else if (label && roomWrap) {
          after(() => {
            roomWrap.style.transition = 'opacity 0.25s ease'
            roomWrap.style.opacity    = '1'
          }, 60)

          after(() => {
            roomWrap.style.transition = 'opacity 0.2s ease'
            roomWrap.style.opacity    = '0'
            after(() => {
              circle.style.transition = 'width 0.52s cubic-bezier(0.4,0,0.8,1), height 0.52s cubic-bezier(0.4,0,0.8,1), opacity 0.52s ease'
              circle.style.width   = '0px'
              circle.style.height  = '0px'
              circle.style.opacity = '0'
              after(() => setVisible(false), 540)
            }, 220)
          }, 820)

        // ── C. FALLBACK ───────────────────────────────────────────────────────
        } else {
          const doContract = () => {
            circle.style.transition = 'width 0.52s cubic-bezier(0.4,0,0.8,1), height 0.52s cubic-bezier(0.4,0,0.8,1), opacity 0.52s ease'
            circle.style.width   = '0px'
            circle.style.height  = '0px'
            circle.style.opacity = '0'
            after(() => setVisible(false), 540)
          }
          if (waitForNav) {
            contractRef.current = doContract
            after(() => { if (contractRef.current) { contractRef.current = null; doContract() } }, 3000)
          } else {
            after(doContract, 320)
          }
        }

      }, 640)
    })
  }, [])

  return (
    <InkContext.Provider value={{ playInk }}>
      {children}

      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: visible ? 'all' : 'none', overflow: 'hidden' }}>

        {/* Ink circle */}
        <div ref={circleRef} style={{ position: 'absolute', borderRadius: '50%', background: '#080604', transform: 'translate(-50%, -50%)', width: 0, height: 0, opacity: 0 }} />

        {/* ── Room transition: destination name ── */}
        <div ref={roomWrapRef} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, pointerEvents: 'none' }}>
          <span ref={roomNameRef} style={{ fontFamily: 'var(--font-anton)', fontSize: 'clamp(40px, 7vw, 88px)', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f5ede0' }} />
        </div>

        {/* ── Page transition: full DEDSTOK preloader ── */}
        <div ref={pageWrapRef} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, pointerEvents: 'none' }}>

          {/* Wordmark */}
          <div ref={wordmarkRef} style={{ clipPath: 'inset(0 100% 0 0)', willChange: 'clip-path' }}>
            <span style={{ fontFamily: 'var(--font-anton)', fontSize: 'clamp(52px, 9vw, 112px)', letterSpacing: '0.08em', color: '#f5ede0', display: 'block', lineHeight: 1 }}>
              DEDSTOK
            </span>
          </div>

          {/* Gold gradient line — width pulses while waiting for nav */}
          <div style={{ width: '100%', maxWidth: '480px', marginTop: 28, marginBottom: 18, overflow: 'hidden' }}>
            <div ref={accentLineRef} style={{
              height: 1,
              width: '0%',
              background: 'linear-gradient(to right, rgba(202,138,4,0.15), rgba(202,138,4,0.75))',
            }} />
          </div>

          {/* Tagline */}
          <div ref={taglineRef} style={{ opacity: 0 }}>
            <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 'clamp(7px, 1vw, 11px)', letterSpacing: '0.38em', textTransform: 'uppercase', color: '#CA8A04', display: 'block', textAlign: 'center' }}>
              One drop. One winner. Every week.
            </span>
          </div>
        </div>
      </div>
    </InkContext.Provider>
  )
}
