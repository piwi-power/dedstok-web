'use client'

import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface InkCtx {
  // label   — shown centered on the overlay while ink is spread (room name, etc.)
  // waitForNav — if true, ink contracts only after the URL pathname changes
  //              (use for page navigation so the old room never flashes through)
  playInk: (x: number, y: number, onCovered: () => void, label?: string, waitForNav?: boolean) => void
}

const InkContext = createContext<InkCtx>({ playInk: () => {} })
export const useInkTransition = () => useContext(InkContext)

export default function InkTransitionProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const circleRef = useRef<HTMLDivElement>(null)
  const labelRef  = useRef<HTMLSpanElement>(null)
  const timers    = useRef<ReturnType<typeof setTimeout>[]>([])
  // Holds the contract function while waiting for page navigation to complete
  const contractRef = useRef<(() => void) | null>(null)

  const pathname    = usePathname()
  const prevPathname = useRef(pathname)

  function clearTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  function after(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
    return id
  }

  // When the pathname changes, the new page has mounted — fire pending contract
  useEffect(() => {
    if (pathname === prevPathname.current) return
    prevPathname.current = pathname
    const fn = contractRef.current
    if (!fn) return
    contractRef.current = null
    // 200 ms grace so the new page paints before ink reveals it
    setTimeout(fn, 200)
  }, [pathname])

  const playInk = useCallback((
    x: number,
    y: number,
    onCovered: () => void,
    label?: string,
    waitForNav?: boolean,
  ) => {
    const circle  = circleRef.current
    const labelEl = labelRef.current
    if (!circle) return
    clearTimers()
    contractRef.current = null

    const maxR = Math.hypot(
      Math.max(x, window.innerWidth  - x),
      Math.max(y, window.innerHeight - y),
    ) * 2.6

    // ── Reset to 0 with no transition ──────────────────────────────────────────
    circle.style.transition = 'none'
    circle.style.left    = x + 'px'
    circle.style.top     = y + 'px'
    circle.style.width   = '0px'
    circle.style.height  = '0px'
    circle.style.opacity = '1'

    if (labelEl) {
      labelEl.style.transition = 'none'
      labelEl.style.opacity    = '0'
      labelEl.textContent      = label ?? ''
    }

    setVisible(true)

    // ── Next frame: start expansion ────────────────────────────────────────────
    requestAnimationFrame(() => {
      circle.style.transition = [
        'width 0.62s cubic-bezier(0.4,0,0.2,1)',
        'height 0.62s cubic-bezier(0.4,0,0.2,1)',
      ].join(', ')
      circle.style.width  = maxR + 'px'
      circle.style.height = maxR + 'px'

      // ── Screen is covered ────────────────────────────────────────────────────
      after(() => {
        onCovered()

        // Fade in label (if any) after onCovered
        if (label && labelEl) {
          after(() => {
            labelEl.style.transition = 'opacity 0.25s ease'
            labelEl.style.opacity    = '1'
          }, 60)
        }

        // ── Contract ─────────────────────────────────────────────────────────
        const doContract = () => {
          // Fade label out first
          if (labelEl && parseFloat(labelEl.style.opacity || '0') > 0) {
            labelEl.style.transition = 'opacity 0.15s ease'
            labelEl.style.opacity    = '0'
          }
          const labelDelay = label ? 180 : 0
          after(() => {
            circle.style.transition = [
              'width 0.52s cubic-bezier(0.4,0,0.8,1)',
              'height 0.52s cubic-bezier(0.4,0,0.8,1)',
              'opacity 0.52s ease',
            ].join(', ')
            circle.style.width   = '0px'
            circle.style.height  = '0px'
            circle.style.opacity = '0'
            after(() => setVisible(false), 540)
          }, labelDelay)
        }

        if (waitForNav) {
          // Hold until pathname changes (new page mounted), 3 s max
          contractRef.current = doContract
          after(() => {
            if (contractRef.current) {
              contractRef.current = null
              doContract()
            }
          }, 3000)
        } else {
          // Fixed hold — room-to-room navigation (synchronous state update)
          after(doContract, 320)
        }

      }, 640)
    })
  }, [])

  return (
    <InkContext.Provider value={{ playInk }}>
      {children}

      {/* Ink overlay — fixed, lives outside page flow */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          pointerEvents: visible ? 'all' : 'none',
          overflow: 'hidden',
        }}
      >
        {/* Expanding ink circle */}
        <div
          ref={circleRef}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            background: '#080604',
            transform: 'translate(-50%, -50%)',
            width: 0, height: 0, opacity: 0,
          }}
        />

        {/* Centered label — destination room name */}
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            ref={labelRef}
            style={{
              fontFamily: 'var(--font-dm-mono)',
              fontSize: 'clamp(9px, 1.4vw, 13px)',
              letterSpacing: '0.38em',
              textTransform: 'uppercase',
              color: 'rgba(245,237,224,0.55)',
              opacity: 0,
            }}
          />
        </div>
      </div>
    </InkContext.Provider>
  )
}
