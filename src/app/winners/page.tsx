export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Winners',
  description: 'Every winner. Every drop. Every week.',
}

// TODO: fetch winners from Supabase joined with drop data
export default function WinnersPage() {
  return (
    <main className="min-h-screen px-6 py-24 max-w-4xl mx-auto">
      <p className="font-[var(--font-dm-mono)] text-[var(--gold)] text-xs tracking-[0.4em] uppercase mb-4">
        Archive
      </p>
      <h1 className="font-[var(--font-serif)] text-[var(--cream)] text-5xl font-bold mb-12">
        Winners
      </h1>
      <p className="text-[var(--cream-dim)]">
        Drop history coming soon.
      </p>
    </main>
  )
}
