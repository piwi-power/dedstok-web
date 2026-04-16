'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ROOMS } from './rooms.config'
import Hotspot from './Hotspot'

interface RoomNavigatorProps {
  isAuthenticated: boolean
  userEmail?: string
}

export default function RoomNavigator({ isAuthenticated, userEmail }: RoomNavigatorProps) {
  const [currentRoomId, setCurrentRoomId] = useState('door')
  const [imgError, setImgError] = useState<Record<string, boolean>>({})
  const router = useRouter()

  const currentRoom = ROOMS[currentRoomId]

  const handleNavigateRoom = useCallback((targetRoomId: string) => {
    setCurrentRoomId(targetRoomId)
  }, [])

  const handleNavigatePage = useCallback((url: string) => {
    router.push(url)
  }, [router])

  return (
    // Full-viewport container — sits below the nav (z-index: 50)
    <div style={{ position: 'fixed', inset: 0, zIndex: 1, overflow: 'hidden' }}>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentRoomId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1.0] }}
          style={{ position: 'absolute', inset: 0 }}
        >
          {/* Gradient fallback — always rendered beneath the image */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: currentRoom.gradient,
          }} />

          {/* Room image — covers the gradient when loaded */}
          {!imgError[currentRoomId] && (
            <Image
              src={currentRoom.image}
              alt={currentRoom.name}
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              priority
              quality={90}
              onError={() => setImgError(prev => ({ ...prev, [currentRoomId]: true }))}
            />
          )}

          {/* Vignette overlay — top and bottom darkening for nav + text legibility */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: [
              'linear-gradient(to bottom,',
              '  rgba(10,8,4,0.55) 0%,',    /* top — nav zone */
              '  transparent 20%,',
              '  transparent 65%,',
              '  rgba(10,8,4,0.7) 100%)',    /* bottom — label zone */
            ].join(' '),
            pointerEvents: 'none',
          }} />

          {/* ── DOOR ─────────────────────────────────── */}
          {currentRoomId === 'door' && <DoorOverlay />}

          {/* ── VAULT ────────────────────────────────── */}
          {currentRoomId === 'vault' && <VaultOverlay />}

          {/* ── Hotspots ─────────────────────────────── */}
          {currentRoom.hotspots.map(hotspot => (
            <Hotspot
              key={hotspot.id}
              hotspot={hotspot}
              onNavigateRoom={handleNavigateRoom}
              onNavigatePage={handleNavigatePage}
              isBackButton={hotspot.id === 'back'}
            />
          ))}

          {/* Room label — bottom right, all rooms except door */}
          {currentRoomId !== 'door' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              style={{
                position: 'absolute',
                bottom: '28px',
                right: '32px',
                pointerEvents: 'none',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '9px',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'rgba(245,237,224,0.25)',
              }}>
                {currentRoom.name}
              </p>
            </motion.div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── Door overlay: branding text over the door image ──────────────────────────
function DoorOverlay() {
  const [logoError, setLogoError] = useState(false)

  return (
    <>
      {/* Tagline centered at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          bottom: '48px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <p style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '10px',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: 'rgba(245,237,224,0.45)',
          whiteSpace: 'nowrap',
        }}>
          One drop.&nbsp; One winner.&nbsp; Every week.
        </p>
      </motion.div>

      {/* Logo overlay on the nameplate — only renders when ds-logo-white.png is present */}
      {!logoError && (
        <div style={{
          position: 'absolute',
          left: '83%',
          top: '28%',
          transform: 'translate(-50%, -50%)',
          width: '80px',
          height: '52px',
          pointerEvents: 'none',
          mixBlendMode: 'luminosity',
          opacity: 0.8,
        }}>
          <Image
            src="/ds-logo-gold.png"
            alt=""
            fill
            unoptimized
            style={{ objectFit: 'contain' }}
            onError={() => setLogoError(true)}
          />
        </div>
      )}
    </>
  )
}

// ── Vault overlay: ambient glow that pulses over the display case ─────────────
function VaultOverlay() {
  return (
    <>
      {/* Pulsing glow centered on the case — roughly 50% left, 50% top */}
      <motion.div
        animate={{
          opacity: [0.3, 0.55, 0.3],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '48%',
          transform: 'translate(-50%, -50%)',
          width: '320px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(202,138,4,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
          mixBlendMode: 'screen',
        }}
      />

      {/* Subtitle above the hotspot */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '22%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <p style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '9px',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(245,237,224,0.3)',
          whiteSpace: 'nowrap',
        }}>
          This week's drop
        </p>
      </motion.div>
    </>
  )
}
