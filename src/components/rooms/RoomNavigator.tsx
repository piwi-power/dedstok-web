'use client'

import { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ROOMS } from './rooms.config'
import Hotspot from './Hotspot'
import RoomNavButton from './RoomNavButton'

interface RoomNavigatorProps {
  isAuthenticated: boolean
  userEmail?: string
}

export default function RoomNavigator({ isAuthenticated, userEmail }: RoomNavigatorProps) {
  const [currentRoomId, setCurrentRoomId] = useState('door')
  const [imgError, setImgError] = useState<Record<string, boolean>>({})
  const [isMobile, setIsMobile] = useState(false)
  const [mobileWidth, setMobileWidth] = useState(0)
  const [panHintVisible, setPanHintVisible] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Read ?room= URL param before first paint — no flash, instant start at correct room
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const room = params.get('room')
    if (room && ROOMS[room]) {
      setCurrentRoomId(room)
    }
  }, [])

  // Mobile detection: landscape room images need horizontal panning on portrait screens
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        // Make inner container exactly 16:9 at full viewport height
        setMobileWidth(Math.round(window.innerHeight * (16 / 9)))
      }
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Re-center scroll to middle of image on each room transition (mobile)
  useEffect(() => {
    const el = scrollRef.current
    if (!el || !isMobile) return
    requestAnimationFrame(() => {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
    })
  }, [currentRoomId, isMobile, mobileWidth])

  // Show pan hint only on the door room on mobile
  useEffect(() => {
    if (isMobile && currentRoomId === 'door') {
      setPanHintVisible(true)
    } else {
      setPanHintVisible(false)
    }
  }, [currentRoomId, isMobile])

  // Hide pan hint on first scroll (re-attaches each time hint becomes visible)
  useEffect(() => {
    if (!panHintVisible) return
    const el = scrollRef.current
    if (!el) return
    const handler = () => setPanHintVisible(false)
    el.addEventListener('scroll', handler, { once: true, passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [panHintVisible])

  const currentRoom = ROOMS[currentRoomId]

  const handleNavigateRoom = useCallback((targetRoomId: string) => {
    setCurrentRoomId(targetRoomId)
  }, [])

  const handleNavigatePage = useCallback((url: string) => {
    router.push(url)
  }, [router])

  return (
    <div
      ref={scrollRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        overflowX: isMobile ? 'auto' : 'hidden',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentRoomId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1.0] }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: isMobile && mobileWidth > 0 ? `${mobileWidth}px` : '100%',
            minWidth: '100%',
          }}
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

          {/* Vignette overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: [
              'linear-gradient(to bottom,',
              '  rgba(10,8,4,0.55) 0%,',
              '  transparent 20%,',
              '  transparent 65%,',
              '  rgba(10,8,4,0.7) 100%)',
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

          {/* ── Edge nav buttons ─────────────────────── */}
          {currentRoom.navButtons?.map(navBtn => (
            <RoomNavButton
              key={navBtn.id}
              navBtn={navBtn}
              onNavigateRoom={handleNavigateRoom}
              onNavigatePage={handleNavigatePage}
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

          {/* Mobile pan hint — hides on first scroll */}
          <AnimatePresence>
            {panHintVisible && <MobilePanHint key="pan-hint" />}
          </AnimatePresence>

        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── Mobile pan hint ───────────────────────────────────────────────────────────
function MobilePanHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, delay: 0.8 }}
      style={{
        position: 'absolute',
        bottom: '28px',
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }}
    >
      <span style={{
        fontFamily: 'var(--font-dm-mono)',
        color: 'rgba(245,237,224,0.3)',
        fontSize: '9px',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}>
        ← swipe to explore →
      </span>
    </motion.div>
  )
}

// ── Door overlay ──────────────────────────────────────────────────────────────
function DoorOverlay() {
  return (
    <>
      {/* Static wrapper handles centering — keeps transform separate from Framer Motion's y animation */}
      <div style={{
        position: 'absolute',
        bottom: '36px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        pointerEvents: 'none',
      }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '10px',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'rgba(245,237,224,0.45)',
            whiteSpace: 'nowrap',
          }}
        >
          One drop.&nbsp; One winner.&nbsp; Every week.
        </motion.p>
      </div>
    </>
  )
}

// ── Vault overlay ─────────────────────────────────────────────────────────────
function VaultOverlay() {
  return (
    <>
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
