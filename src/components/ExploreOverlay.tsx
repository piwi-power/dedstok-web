'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// Fast-travel: links go to homepage with ?room= param.
// RoomNavigator reads the param and starts at that room.
const ROOMS = [
  { index: '01', name: 'THE LOBBY',    desc: 'The entrance',              href: '/?room=lobby' },
  { index: '02', name: 'THE VAULT',    desc: "This week's drop",          href: '/?room=vault' },
  { index: '03', name: 'THE HALL',     desc: 'Top earners, all time',     href: '/?room=hall' },
  { index: '04', name: 'THE GALLERY',  desc: 'Every drop. Every winner.', href: '/?room=gallery' },
  { index: '05', name: 'THE STUDY',    desc: 'Culture & stories',         href: '/?room=study' },
]

export default function ExploreOverlay() {
  const [open, setOpen] = useState(false)

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Lock scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '10px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--cream-dim)',
          background: 'none',
          border: '1px solid rgba(245,237,224,0.15)',
          cursor: 'pointer',
          padding: '6px 14px',
          borderRadius: '2px',
          transition: 'color 150ms, border-color 150ms',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--cream)'
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,237,224,0.4)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--cream-dim)'
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,237,224,0.15)'
        }}
      >
        Explore
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 200,
              background: 'rgba(10, 8, 4, 0.93)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
            }}
          >
            {/* Content — stop click propagation so clicking links doesn't misfire */}
            <div
              style={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '0 clamp(24px, 6vw, 96px)',
                maxWidth: '960px',
                margin: '0 auto',
              }}
              onClick={e => e.stopPropagation()}
            >

              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                style={{
                  position: 'absolute',
                  top: '28px',
                  right: 'clamp(24px, 6vw, 96px)',
                  fontFamily: 'var(--font-dm-mono)',
                  fontSize: '9px',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,237,224,0.3)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 0',
                  transition: 'color 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--cream)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,237,224,0.3)')}
              >
                ESC to close
              </button>

              {/* Label */}
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.3 }}
                style={{
                  fontFamily: 'var(--font-dm-mono)',
                  color: 'rgba(245,237,224,0.2)',
                  fontSize: '9px',
                  letterSpacing: '0.45em',
                  textTransform: 'uppercase',
                  marginBottom: '40px',
                }}
              >
                Select a room
              </motion.p>

              {/* Room list */}
              <nav style={{ display: 'flex', flexDirection: 'column' }}>
                {ROOMS.map((room, i) => (
                  <motion.div
                    key={room.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.055, duration: 0.35, ease: 'easeOut' }}
                  >
                    <RoomRow room={room} onNavigate={() => setOpen(false)} />
                  </motion.div>
                ))}
              </nav>

              {/* Bottom corner — tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                style={{
                  position: 'absolute',
                  bottom: '32px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontFamily: 'var(--font-dm-mono)',
                  color: 'rgba(245,237,224,0.12)',
                  fontSize: '9px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                One drop. One winner. Every week.
              </motion.p>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function RoomRow({
  room,
  onNavigate,
}: {
  room: (typeof ROOMS)[0]
  onNavigate: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={room.href}
      onClick={onNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '20px',
        padding: '16px 0',
        paddingLeft: hovered ? '18px' : '0',
        borderBottom: '1px solid rgba(245,237,224,0.07)',
        textDecoration: 'none',
        transition: 'padding-left 220ms cubic-bezier(0.25, 0, 0, 1)',
      }}
    >
      {/* Index */}
      <span
        style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '11px',
          color: hovered ? 'rgba(202,138,4,0.6)' : 'rgba(245,237,224,0.18)',
          letterSpacing: '0.08em',
          minWidth: '28px',
          transition: 'color 200ms ease-out',
        }}
      >
        {room.index}
      </span>

      {/* Room name */}
      <span
        style={{
          fontFamily: 'var(--font-anton)',
          fontSize: 'clamp(32px, 4.5vw, 64px)',
          color: hovered ? 'var(--gold)' : 'var(--cream)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          lineHeight: 1.05,
          transition: 'color 220ms ease-out',
        }}
      >
        {room.name}
      </span>

      {/* Descriptor */}
      <span
        style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '9px',
          color: hovered ? 'rgba(245,237,224,0.4)' : 'rgba(245,237,224,0.18)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          transition: 'color 200ms ease-out',
          alignSelf: 'center',
          paddingBottom: '2px',
        }}
      >
        {room.desc}
      </span>
    </Link>
  )
}
