'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { RoomNavButton as RoomNavButtonConfig } from './rooms.config'

interface Props {
  navBtn: RoomNavButtonConfig
  onNavigateRoom: (roomId: string) => void
  onNavigatePage: (url: string) => void
}

export default function RoomNavButton({ navBtn, onNavigateRoom, onNavigatePage }: Props) {
  const [hovered, setHovered] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const isRight = navBtn.direction === 'right'

  // On touch devices hover never fires — always show label so users know where the button goes
  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches)
  }, [])

  const showLabel = hovered || isTouch

  function handleClick() {
    if (navBtn.action.type === 'navigate-room') {
      onNavigateRoom(navBtn.action.target)
    } else {
      onNavigatePage(navBtn.action.target)
    }
  }

  const ArrowIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      style={{ flexShrink: 0, transition: 'transform 200ms ease' }}
    >
      {isRight ? (
        <path
          d="M3 9H15M15 9L10 4.5M15 9L10 13.5"
          stroke={hovered ? '#ca8a04' : 'rgba(245,237,224,0.55)'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M15 9H3M3 9L8 4.5M3 9L8 13.5"
          stroke={hovered ? '#ca8a04' : 'rgba(245,237,224,0.55)'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )

  return (
    // Positioning wrapper — keeps the button flush to the edge
    <div
      style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        ...(isRight ? { right: 0 } : { left: 0 }),
        zIndex: 20,
      }}
    >
      <motion.button
        layout
        onClick={handleClick}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        transition={{ layout: { duration: 0.2, ease: 'easeOut' } }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          background: 'rgba(12,10,9,0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(245,237,224,0.1)',
          // Flush to the edge — only the inner side has a border
          ...(isRight
            ? { borderRight: 'none', paddingLeft: '16px', paddingRight: '20px' }
            : { borderLeft: 'none', paddingRight: '16px', paddingLeft: '20px' }),
          paddingTop: '14px',
          paddingBottom: '14px',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
        aria-label={navBtn.label}
      >
        {/* Left-side button: arrow first, then label */}
        {!isRight && <ArrowIcon />}

        <AnimatePresence>
          {showLabel && (
            <motion.span
              key="label"
              initial={{ width: 0, opacity: 0, marginLeft: isRight ? 0 : 10, marginRight: isRight ? 10 : 0 }}
              animate={{ width: 'auto', opacity: 1, marginLeft: isRight ? 0 : 10, marginRight: isRight ? 10 : 0 }}
              exit={{ width: 0, opacity: 0, marginLeft: 0, marginRight: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
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
              {navBtn.label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Right-side button: label first, then arrow */}
        {isRight && <ArrowIcon />}
      </motion.button>
    </div>
  )
}
