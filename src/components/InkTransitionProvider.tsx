'use client'

import { createContext, useContext, useRef, useState, useCallback } from 'react'

interface InkCtx {
  playInk: (x: number, y: number, onCovered: () => void) => void
}

const InkContext = createContext<InkCtx>({ playInk: () => {} })
export const useInkTransition = () => useContext(InkContext)

export default function InkTransitionProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const circleRef = useRef<HTMLDivElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  function clearTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  function after(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
    return id
  }

  const playInk = useCallback((x: number, y: number, onCovered: () => void) => {
    const circle = circleRef.current
    if (!circle) return
    clearTimers()

    const maxR = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    ) * 2.6

    // Reset to 0 with no transition
    circle.style.transition = 'none'
    circle.style.left = x + 'px'
    circle.style.top = y + 'px'
    circle.style.width = '0px'
    circle.style.height = '0px'
    circle.style.opacity = '1'
    setVisible(true)

    // Next frame: start expansion
    requestAnimationFrame(() => {
      circle.style.transition = [
        'width 0.62s cubic-bezier(0.4,0,0.2,1)',
        'height 0.62s cubic-bezier(0.4,0,0.2,1)',
      ].join(', ')
      circle.style.width = maxR + 'px'
      circle.style.height = maxR + 'px'

      // Screen is covered — fire callback (navigation happens here)
      after(() => {
        onCovered()

        // Brief hold, then contract
        after(() => {
          circle.style.transition = [
            'width 0.52s cubic-bezier(0.4,0,0.8,1)',
            'height 0.52s cubic-bezier(0.4,0,0.8,1)',
            'opacity 0.52s ease',
          ].join(', ')
          circle.style.width = '0px'
          circle.style.height = '0px'
          circle.style.opacity = '0'

          after(() => setVisible(false), 540)
        }, 320)
      }, 640)
    })
  }, [])

  return (
    <InkContext.Provider value={{ playInk }}>
      {children}
      {/* Ink overlay — lives outside page flow, persists across all navigations */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          pointerEvents: visible ? 'all' : 'none',
          overflow: 'hidden',
        }}
      >
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
      </div>
    </InkContext.Provider>
  )
}
