'use client'

import Link from 'next/link'

export default function BackButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: 'rgba(245,237,224,0.35)',
        fontSize: '9px',
        fontFamily: 'var(--font-dm-mono)',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        marginBottom: '28px',
        transition: 'color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(245,237,224,0.7)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,237,224,0.35)')}
    >
      ← Back
    </Link>
  )
}
