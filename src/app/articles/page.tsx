export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Culture',
  description: 'Sneaker history, drop guides, grail profiles, and streetwear culture.',
}

// TODO: fetch articles from Sanity using ALL_ARTICLES_QUERY
export default function ArticlesPage() {
  return (
    <main className="min-h-screen px-6 py-24 max-w-4xl mx-auto">
      <p className="font-[var(--font-dm-mono)] text-[var(--gold)] text-xs tracking-[0.4em] uppercase mb-4">
        Culture
      </p>
      <h1 className="font-[var(--font-serif)] text-[var(--cream)] text-5xl font-bold mb-12">
        The Edit
      </h1>
      <p className="text-[var(--cream-dim)]">
        Articles coming soon.
      </p>
    </main>
  )
}
