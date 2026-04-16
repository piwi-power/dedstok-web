import type { Metadata } from 'next'
import Link from 'next/link'
import { getSanityClient } from '@/lib/sanity/client'
import { ALL_ARTICLES_QUERY } from '@/lib/sanity/queries'
import type { SanityArticle } from '@/types'

export const metadata: Metadata = {
  title: 'Culture',
  description: 'Sneaker history, drop guides, grail profiles, and streetwear culture.',
}

export const revalidate = 60

export default async function ArticlesPage() {
  let articles: SanityArticle[] = []
  try {
    articles = await getSanityClient().fetch<SanityArticle[]>(ALL_ARTICLES_QUERY)
  } catch {
    // Sanity not configured yet — render empty state
  }

  return (
    <main style={{ minHeight: '100vh', padding: '56px 32px 120px', maxWidth: '900px', margin: '0 auto' }}>
      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '12px' }}>
        Culture
      </p>
      <h1 style={{ fontFamily: 'var(--font-bodoni)', fontWeight: 700, color: 'var(--cream)', fontSize: '56px', lineHeight: 1.05, marginBottom: '56px', letterSpacing: '-0.5px' }}>
        The Edit
      </h1>

      {!articles || articles.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.3)', fontSize: '14px' }}>
          No articles yet.
        </p>
      ) : (
        <div>
          {articles.map((article) => (
            <Link
              key={article._id}
              href={`/articles/${article.slug.current}`}
              style={{ display: 'block', padding: '28px 0', borderBottom: '1px solid rgba(245,237,224,0.07)', textDecoration: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '32px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '10px' }}>
                    {article.category}
                  </p>
                  <h2 style={{ fontFamily: 'var(--font-bodoni)', fontWeight: 700, color: 'var(--cream)', fontSize: '22px', marginBottom: '10px', lineHeight: 1.3, letterSpacing: '-0.25px' }}>
                    {article.title}
                  </h2>
                  <p style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.45)', fontSize: '13px', lineHeight: 1.6 }}>
                    {article.excerpt}
                  </p>
                </div>
                <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.25)', fontSize: '9px', whiteSpace: 'nowrap', marginTop: '4px' }}>
                  {new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
