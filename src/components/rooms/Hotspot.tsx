'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Hotspot as HotspotConfig } from './rooms.config'

interface HotspotProps {
  hotspot: HotspotConfig
  onNavigateRoom: (roomId: string) => void
  onNavigatePage: (url: string) => void
  isBackButton?: boolean
}

// ── Animated chevrons — the "light moving inside" ─────────────────────────────
// Room nav: double sideways ›› or ‹‹  |  Page nav: single upward ↑
function ChevronPair({ active, isLeft, isPageNav }: { active: boolean; isLeft: boolean; isPageNav: boolean }) {
  const stroke = active ? '#ca8a04' : 'rgba(245,237,224,0.92)'

  if (isPageNav) {
    // Single upward chevron — "open / enter page"
    return (
      <motion.svg
        width="15"
        height="9"
        viewBox="0 0 15 9"
        fill="none"
        animate={active ? { opacity: 1 } : { opacity: [0.28, 0.9, 0.28] }}
        transition={active
          ? { duration: 0.15 }
          : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <path
          d="M1.5 7.5L7.5 1.5L13.5 7.5"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    )
  }

  // Double sideways chevrons — room-to-room navigation
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[0, 1].map(i => (
        <motion.svg
          key={i}
          width="9"
          height="15"
          viewBox="0 0 9 15"
          fill="none"
          animate={active
            ? { opacity: 1 }
            : { opacity: [0.28, 0.9, 0.28] }
          }
          transition={active
            ? { duration: 0.15 }
            : { duration: 1.6, repeat: Infinity, delay: i * 0.28, ease: 'easeInOut' }
          }
        >
          {isLeft ? (
            <path
              d="M7 1.5L1.5 7.5L7 13.5"
              stroke={stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M2 1.5L7.5 7.5L2 13.5"
              stroke={stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </motion.svg>
      ))}
    </div>
  )
}

export default function Hotspot({ hotspot, onNavigateRoom, onNavigatePage, isBackButton }: HotspotProps) {
  const [hovered, setHovered] = useState(false)
  const [tapped, setTapped] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches)
  }, [])

  // Tap-outside-to-dismiss on mobile
  useEffect(() => {
    if (!tapped) return
    const dismiss = () => setTapped(false)
    const timer = setTimeout(() => {
      document.addEventListener('click', dismiss, { once: true })
    }, 60)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', dismiss)
    }
  }, [tapped])

  const handleClick = () => {
    if (hotspot.action.type === 'navigate-room') {
      onNavigateRoom(hotspot.action.target)
    } else {
      onNavigatePage(hotspot.action.target)
    }
  }

  const handleTap = (e: React.MouseEvent) => {
    if (!isTouch) {
      // Desktop: click always navigates (label is shown on hover)
      handleClick()
      return
    }
    // Mobile: first tap reveals label, second tap navigates
    e.stopPropagation()
    if (tapped) {
      handleClick()
    } else {
      setTapped(true)
    }
  }

  // ── Back button ─────────────────────────────────────────────────────────────
  if (isBackButton) {
    return (
      <button
        onClick={handleClick}
        style={{
          position: 'absolute',
          left: `${hotspot.x}%`,
          top: `${hotspot.y}%`,
          transform: 'translate(-50%, -50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px',
          zIndex: 10,
        }}
        aria-label={`Go to ${hotspot.label}`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8L10 13" stroke="rgba(245,237,224,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '9px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(245,237,224,0.4)',
        }}>
          {hotspot.label}
        </span>
      </button>
    )
  }

  // ── Circle-nav variant (vault → gallery button) ─────────────────────────────
  if (hotspot.variant === 'circle-nav') {
    const showLabel = hovered || tapped
    return (
      <div
        style={{ position: 'absolute', left: `${hotspot.x}%`, top: `${hotspot.y}%`, transform: 'translate(-50%, -50%)', zIndex: 10 }}
        onMouseEnter={() => !isTouch && setHovered(true)}
        onMouseLeave={() => !isTouch && setHovered(false)}
        onClick={(e) => { e.stopPropagation(); isTouch ? setTapped(!tapped) : handleClick() }}
      >
        <motion.button
          layout
          onClick={!isTouch ? handleClick : undefined}
          transition={{ layout: { duration: 0.22, ease: 'easeOut' } }}
          style={{
            display: 'flex',
            flexDirection: 'row-reverse',
            alignItems: 'center',
            gap: 0,
            background: 'rgba(10,8,4,0.68)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: `1px solid ${hovered || tapped ? 'rgba(202,138,4,0.4)' : 'rgba(245,237,224,0.14)'}`,
            borderRadius: '100px',
            padding: '13px',
            cursor: 'pointer',
            overflow: 'hidden',
            transition: 'border-color 200ms ease',
          }}
          aria-label={hotspot.label}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
            <path
              d="M3 9H15M15 9L10 4.5M15 9L10 13.5"
              stroke={hovered || tapped ? '#ca8a04' : 'rgba(245,237,224,0.6)'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <AnimatePresence>
            {showLabel && (
              <motion.span
                key="label"
                initial={{ width: 0, opacity: 0, marginRight: 0 }}
                animate={{ width: 'auto', opacity: 1, marginRight: 10 }}
                exit={{ width: 0, opacity: 0, marginRight: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#ca8a04', whiteSpace: 'nowrap', overflow: 'hidden', display: 'block' }}
              >
                {hotspot.label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    )
  }

  // ── Standard pill hotspot ────────────────────────────────────────────────────
  const isLeft = hotspot.arrowDirection === 'left'
  const isPageNav = hotspot.action.type === 'navigate-page'
  const active = isTouch ? tapped : hovered

  return (
    <div
      style={{ position: 'absolute', left: `${hotspot.x}%`, top: `${hotspot.y}%`, transform: 'translate(-50%, -50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      onMouseEnter={() => !isTouch && setHovered(true)}
      onMouseLeave={() => !isTouch && setHovered(false)}
      onClick={handleTap}
    >
      {/* Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          background: 'rgba(10,8,4,0.68)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: `1px solid ${active ? 'rgba(202,138,4,0.38)' : 'rgba(245,237,224,0.13)'}`,
          borderRadius: '100px',
          padding: '10px 16px',
          cursor: 'pointer',
          transition: 'border-color 220ms ease',
        }}
        aria-label={hotspot.label}
      >
        <ChevronPair active={active} isLeft={isLeft} isPageNav={isPageNav} />
      </div>

      {/* Label — appears below the pill */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{ textAlign: 'center', marginTop: 12, pointerEvents: 'none' }}
          >
            <p style={{
              fontFamily: 'var(--font-dm-mono)',
              fontSize: '10px',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#ca8a04',
              whiteSpace: 'nowrap',
              textShadow: '0 0 20px rgba(0,0,0,1), 0 1px 4px rgba(0,0,0,0.9)',
            }}>
              {hotspot.label}
            </p>
            {hotspot.sublabel && (
              <p style={{
                fontFamily: 'var(--font-jost)',
                fontSize: '11px',
                color: 'rgba(245,237,224,0.5)',
                marginTop: 3,
                whiteSpace: 'nowrap',
                textShadow: '0 0 12px rgba(0,0,0,1)',
              }}>
                {hotspot.sublabel}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
