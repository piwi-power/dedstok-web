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
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md space-y-6">
        <p
          style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.4em' }}
          className="text-[var(--gold)] text-xs uppercase"
        >
          Entry Confirmed
        </p>
        <h1
          style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.15em' }}
          className="text-[var(--cream)] text-6xl"
        >
          You're In
        </h1>
        <p
          style={{ fontFamily: 'var(--font-dm-mono)' }}
          className="text-[var(--cream-dim)] text-sm leading-relaxed"
        >
          Your spot is locked. A confirmation email is on its way.
          The draw happens Saturday. One winner. That could be you.
        </p>
        <div className="flex flex-col gap-3 pt-4">
          <Link
            href="/account"
            style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
            className="inline-block bg-[var(--gold)] hover:bg-[var(--gold-light)] text-[var(--bg)] text-xs uppercase px-8 py-4 rounded-full transition-colors"
          >
            View My Entries
          </Link>
          <Link
            href="/"
            style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
            className="text-[var(--cream-dim)] text-xs uppercase hover:text-[var(--cream)] transition-colors"
          >
            Back to Home
          </Link>
        </div>
        {session_id && (
          <p
            style={{ fontFamily: 'var(--font-dm-mono)' }}
            className="text-[var(--cream-dim)] text-[10px] opacity-40"
          >
            Ref: {session_id.slice(-8).toUpperCase()}
          </p>
        )}
      </div>
    </main>
  )
}
