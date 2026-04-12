'use client'

import Link from 'next/link'

export default function BackButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: 'rgba(245,237,224,0.4)',
        fontSize: '11px',
        fontFamily: 'sans-serif',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        marginBottom: '32px',
        transition: 'color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(245,237,224,0.8)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,237,224,0.4)')}
    >
      ← Back
    </Link>
  )
}
