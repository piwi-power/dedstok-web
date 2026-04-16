export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: "You're In" }

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '420px' }}>
        <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '16px' }}>
          Entry Confirmed
        </p>
        <h1 style={{ fontFamily: 'var(--font-anton)', color: 'var(--cream)', fontSize: '72px', letterSpacing: '0.05em', textTransform: 'uppercase', lineHeight: 1, marginBottom: '20px' }}>
          YOU&apos;RE IN
        </h1>
        <p style={{ fontFamily: 'var(--font-jost)', color: 'var(--cream-dim)', fontSize: '14px', lineHeight: 1.7, marginBottom: '32px' }}>
          Your spot is locked. A confirmation email is on its way.
          The draw happens Saturday. One winner. That could be you.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link
            href="/account"
            style={{
              fontFamily: 'var(--font-dm-mono)',
              letterSpacing: '0.2em',
              color: 'var(--bg)',
              background: 'var(--gold)',
              fontSize: '9px',
              textTransform: 'uppercase',
              padding: '16px 32px',
              display: 'inline-block',
              textDecoration: 'none',
              borderRadius: '2px',
            }}
          >
            View My Entries
          </Link>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-dm-mono)',
              letterSpacing: '0.2em',
              color: 'var(--cream-dim)',
              fontSize: '9px',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Back to Home
          </Link>
        </div>
        {session_id && (
          <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.2)', fontSize: '9px', marginTop: '32px' }}>
            Ref: {session_id.slice(-8).toUpperCase()}
          </p>
        )}
      </div>
    </main>
  )
}
