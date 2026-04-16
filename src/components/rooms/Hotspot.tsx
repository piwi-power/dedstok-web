'use client'

import { useState } from 'react'
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

  const handleClick = () => {
    if (hotspot.action.type === 'navigate-room') {
      onNavigateRoom(hotspot.action.target)
    } else {
      onNavigatePage(hotspot.action.target)
    }
  }

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

  // Is this the main display case hotspot?
  const isCaseHotspot = hotspot.id === 'drop-case'

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

        {/* Label block — always visible, intensifies on hover */}
        <AnimatePresence>
          <motion.div
            animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0.6, y: 0 }}
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
            }}>
              {hotspot.label}
            </span>
            {hotspot.sublabel && (
              <span style={{
                fontFamily: 'var(--font-jost)',
                fontSize: '11px',
                color: 'var(--cream-dim)',
                whiteSpace: 'nowrap',
              }}>
                {hotspot.sublabel}
              </span>
            )}
            {/* Arrow */}
            <motion.svg
              width="16"
              height="8"
              viewBox="0 0 16 8"
              fill="none"
              animate={hovered ? { y: 3 } : { y: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <path d="M0 4H14M14 4L10 1M14 4L10 7" stroke={hovered ? '#CA8A04' : 'rgba(245,237,224,0.4)'} strokeWidth="1" strokeLinecap="round" />
            </motion.svg>
          </motion.div>
        </AnimatePresence>
      </button>
    </div>
  )
}
