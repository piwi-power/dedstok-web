export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import AuthForm from '@/components/AuthForm'

export const metadata: Metadata = {
  title: 'Sign In — DEDSTOK',
}

interface Props {
  searchParams: Promise<{ next?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px',
    }}>

      {/* Wordmark */}
      <Link href="/" style={{ textDecoration: 'none', marginBottom: '48px' }}>
        <span style={{
          fontFamily: 'var(--font-anton)',
          fontSize: '28px',
          letterSpacing: '0.08em',
          color: 'var(--cream)',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}>
          DEDSTOK
        </span>
      </Link>

      {/* Header */}
      <p style={{
        fontFamily: 'var(--font-dm-mono)',
        color: 'var(--gold)',
        fontSize: '9px',
        letterSpacing: '0.4em',
        textTransform: 'uppercase',
        marginBottom: '12px',
        textAlign: 'center',
      }}>
        Sign In
      </p>
      <p style={{
        fontFamily: 'var(--font-jost)',
        color: 'rgba(245,237,224,0.4)',
        fontSize: '14px',
        marginBottom: '40px',
        textAlign: 'center',
        maxWidth: '320px',
        lineHeight: 1.6,
      }}>
        One account. Every drop. No password.
      </p>

      {/* Error state */}
      {error && (
        <p style={{
          fontFamily: 'var(--font-dm-mono)',
          color: 'rgba(239,68,68,0.85)',
          fontSize: '11px',
          letterSpacing: '0.1em',
          marginBottom: '24px',
          textAlign: 'center',
        }}>
          Something went wrong. Try again.
        </p>
      )}

      {/* Auth form — already handles email OTP + Google */}
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <AuthForm redirectTo={next ?? '/'} />
      </div>

    </main>
  )
}
