'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      style={{
        fontFamily: 'var(--font-dm-mono)',
        fontSize: '9px',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'rgba(245,237,224,0.28)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '0',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'color 150ms ease, text-shadow 150ms ease',
        marginBottom: '40px',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.color = '#f5ede0'
        el.style.textShadow = '0 0 14px rgba(245,237,224,0.45)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.color = 'rgba(245,237,224,0.28)'
        el.style.textShadow = 'none'
      }}
    >
      ← Back
    </button>
  )
}
