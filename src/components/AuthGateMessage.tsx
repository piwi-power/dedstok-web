'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface AuthGateMessageProps {
  visible: boolean
  returnTo: string
  onDismiss: () => void
}

export default function AuthGateMessage({ visible, returnTo, onDismiss }: AuthGateMessageProps) {
  const router = useRouter()

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [visible, onDismiss])

  function handleEnter() {
    const url = `/login?next=${encodeURIComponent(returnTo)}&tab=signup`
    router.push(url)
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Tap outside to dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onDismiss}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 90,
            }}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 100,
              padding: '0 16px 32px',
            }}
          >
            <div
              style={{
                maxWidth: '480px',
                margin: '0 auto',
                background: 'rgba(12,10,9,0.96)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(202,138,4,0.25)',
                borderRadius: '4px',
                padding: '24px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '24px',
              }}
            >
              {/* Message */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: 'var(--font-dm-mono)',
                  fontSize: '9px',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  marginBottom: '6px',
                }}>
                  Members Only
                </p>
                <p style={{
                  fontFamily: 'var(--font-jost)',
                  fontSize: '15px',
                  fontWeight: 300,
                  color: 'var(--cream)',
                  lineHeight: 1.3,
                }}>
                  You&apos;re not in yet.
                </p>
              </div>

              {/* CTA */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
                <button
                  onClick={handleEnter}
                  style={{
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: '10px',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: '#0c0a09',
                    background: 'var(--gold)',
                    border: 'none',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Enter
                </button>
                <button
                  onClick={onDismiss}
                  aria-label="Dismiss"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: 'rgba(245,237,224,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
