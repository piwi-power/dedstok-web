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
  const articles = await getSanityClient().fetch<SanityArticle[]>(ALL_ARTICLES_QUERY)

  return (
    <main style={{ minHeight: '100vh', padding: '60px 24px', maxWidth: '900px', margin: '0 auto' }}>
      <p style={{ color: '#CA8A04', fontFamily: 'sans-serif', fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '16px' }}>
        Culture
      </p>
      <h1 style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '40px', fontWeight: 700, marginBottom: '56px' }}>
        The Edit
      </h1>

      {!articles || articles.length === 0 ? (
        <p style={{ color: 'rgba(245,237,224,0.4)', fontFamily: 'sans-serif', fontSize: '14px' }}>
          No articles yet.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '2px' }}>
          {articles.map((article) => (
            <Link
              key={article._id}
              href={`/articles/${article.slug.current}`}
              style={{
                display: 'block',
                padding: '28px 0',
                borderBottom: '1px solid rgba(245,237,224,0.08)',
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#CA8A04', fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {article.category}
                  </p>
                  <h2 style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '20px', fontWeight: 600, marginBottom: '8px', lineHeight: 1.3 }}>
                    {article.title}
                  </h2>
                  <p style={{ color: 'rgba(245,237,224,0.5)', fontFamily: 'sans-serif', fontSize: '13px', lineHeight: 1.5 }}>
                    {article.excerpt}
                  </p>
                </div>
                <p style={{ color: 'rgba(245,237,224,0.3)', fontFamily: 'sans-serif', fontSize: '11px', whiteSpace: 'nowrap', marginTop: '4px' }}>
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
