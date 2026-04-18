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

export default function Hotspot({ hotspot, onNavigateRoom, onNavigatePage, isBackButton }: HotspotProps) {
  const [hovered, setHovered] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches)
  }, [])

  const handleClick = () => {
    if (hotspot.action.type === 'navigate-room') {
      onNavigateRoom(hotspot.action.target)
    } else {
      onNavigatePage(hotspot.action.target)
    }
  }

  // ── Back button ────────────────────────────────────────────────────────────
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
          transition: 'color 150ms ease-out',
        }}>
          {hotspot.label}
        </span>
      </button>
    )
  }

  // ── Circle-nav variant ─────────────────────────────────────────────────────
  // A pill/circle button positioned directly on the image (e.g. vault → gallery).
  // Shows arrow only when collapsed; reveals label on hover (desktop) or always (touch).
  if (hotspot.variant === 'circle-nav') {
    const showLabel = hovered || isTouch

    return (
      <div
        style={{
          position: 'absolute',
          left: `${hotspot.x}%`,
          top: `${hotspot.y}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <motion.button
          layout
          onClick={handleClick}
          transition={{ layout: { duration: 0.22, ease: 'easeOut' } }}
          style={{
            display: 'flex',
            flexDirection: 'row-reverse', // label left, arrow right
            alignItems: 'center',
            gap: 0,
            background: 'rgba(10,8,4,0.68)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: `1px solid ${hovered ? 'rgba(202,138,4,0.4)' : 'rgba(245,237,224,0.14)'}`,
            borderRadius: '100px',
            padding: '13px',
            cursor: 'pointer',
            overflow: 'hidden',
            transition: 'border-color 200ms ease',
          }}
          aria-label={hotspot.label}
        >
          {/* Arrow pointing right (toward gallery) */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M3 9H15M15 9L10 4.5M15 9L10 13.5"
              stroke={hovered ? '#ca8a04' : 'rgba(245,237,224,0.6)'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: 'stroke 200ms ease' }}
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
                style={{
                  fontFamily: 'var(--font-dm-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#ca8a04',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  display: 'block',
                }}
              >
                {hotspot.label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    )
  }

  // ── Standard beacon hotspot ────────────────────────────────────────────────
  const isLeft = hotspot.arrowDirection === 'left'

  return (
    <div
      style={{
        position: 'absolute',
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={handleClick}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          padding: '0',
        }}
        aria-label={hotspot.label}
      >
        {/* Beacon */}
        <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          {/* Outer ring — pulses */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid var(--gold)',
            }}
          />

          {/* Inner dot */}
          <motion.div
            animate={hovered ? { scale: 1.3 } : { scale: 1 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: hovered ? 'var(--gold-light)' : 'var(--gold)',
              boxShadow: hovered
                ? '0 0 20px var(--gold-glow), 0 0 40px var(--gold-glow)'
                : '0 0 12px var(--gold-glow)',
            }}
          />
        </div>

        {/* Label block */}
        <AnimatePresence>
          <motion.div
            animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0.75, y: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              pointerEvents: 'none',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-dm-mono)',
              fontSize: '10px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: hovered ? 'var(--gold)' : 'var(--cream)',
              transition: 'color 150ms ease-out',
              whiteSpace: 'nowrap',
              textShadow: '0 0 16px rgba(0,0,0,1), 0 1px 4px rgba(0,0,0,0.9)',
            }}>
              {hotspot.label}
            </span>
            {hotspot.sublabel && (
              <span style={{
                fontFamily: 'var(--font-jost)',
                fontSize: '11px',
                color: 'var(--cream-dim)',
                whiteSpace: 'nowrap',
                textShadow: '0 0 12px rgba(0,0,0,1), 0 1px 4px rgba(0,0,0,0.9)',
              }}>
                {hotspot.sublabel}
              </span>
            )}
            {/* Directional arrow */}
            <motion.svg
              width="16"
              height="8"
              viewBox="0 0 16 8"
              fill="none"
              animate={hovered ? { x: isLeft ? -3 : 3 } : { x: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {isLeft ? (
                <path d="M14 4H2M2 4L6 1M2 4L6 7" stroke={hovered ? '#CA8A04' : 'rgba(245,237,224,0.4)'} strokeWidth="1" strokeLinecap="round" />
              ) : (
                <path d="M0 4H14M14 4L10 1M14 4L10 7" stroke={hovered ? '#CA8A04' : 'rgba(245,237,224,0.4)'} strokeWidth="1" strokeLinecap="round" />
              )}
            </motion.svg>
          </motion.div>
        </AnimatePresence>
      </button>
    </div>
  )
}
