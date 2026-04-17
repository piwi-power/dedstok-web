import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { getSanityClient } from '@/lib/sanity/client'
import { ARTICLE_BY_SLUG_QUERY, ALL_ARTICLE_SLUGS_QUERY } from '@/lib/sanity/queries'
import type { SanityArticle } from '@/types'
import imageUrlBuilder from '@sanity/image-url'
import ShareButton from '@/components/ShareButton'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getSanityClient().fetch<{ slug: string }[]>(ALL_ARTICLE_SLUGS_QUERY)
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const client = getSanityClient()
  const article = await client.fetch<SanityArticle>(ARTICLE_BY_SLUG_QUERY, { slug })
  if (!article) return { title: 'Not Found' }

  const ogImage = article.cover_image
    ? imageUrlBuilder(client).image(article.cover_image).width(1200).height(630).fit('crop').url()
    : undefined

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
  }
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dedstok.com'

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getSanityClient().fetch<SanityArticle>(ARTICLE_BY_SLUG_QUERY, { slug })

  if (!article) notFound()

  return (
    <main style={{ minHeight: '100vh', padding: '80px 24px 120px', maxWidth: '680px', margin: '0 auto' }}>
      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '16px' }}>
        {article.category}
      </p>
      <h1 style={{ fontFamily: 'var(--font-bodoni)', fontWeight: 700, color: 'var(--cream)', fontSize: '40px', lineHeight: 1.2, marginBottom: '20px', letterSpacing: '-0.25px' }}>
        {article.title}
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.35)', fontSize: '10px', letterSpacing: '0.1em' }}>
            {new Date(article.published_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
          {article.author && (
            <>
              <span style={{ color: 'rgba(245,237,224,0.15)', fontSize: '11px' }}>·</span>
              <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.35)', fontSize: '10px', letterSpacing: '0.1em' }}>
                {article.author}
              </p>
            </>
          )}
        </div>
        <ShareButton
          title={article.title}
          text={article.excerpt}
          url={`${siteUrl}/articles/${slug}`}
        />
      </div>

      <div style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.75)', fontSize: '15px', lineHeight: 1.8, marginBottom: '56px' }}>
        {article.body ? (
          <PortableText
            value={article.body as Parameters<typeof PortableText>[0]['value']}
            components={{
              block: {
                normal: ({ children }) => (
                  <p style={{ marginBottom: '20px' }}>{children}</p>
                ),
                h2: ({ children }) => (
                  <h2 style={{ fontFamily: 'var(--font-bodoni)', fontWeight: 700, color: 'var(--cream)', fontSize: '24px', marginTop: '48px', marginBottom: '14px', letterSpacing: '-0.2px' }}>{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 style={{ fontFamily: 'var(--font-bodoni)', fontWeight: 700, color: 'var(--cream)', fontSize: '19px', marginTop: '36px', marginBottom: '10px' }}>{children}</h3>
                ),
                blockquote: ({ children }) => (
                  <blockquote style={{ borderLeft: '2px solid var(--gold)', paddingLeft: '20px', color: 'rgba(245,237,224,0.5)', fontStyle: 'italic', margin: '32px 0' }}>{children}</blockquote>
                ),
              },
              marks: {
                strong: ({ children }) => <strong style={{ color: 'var(--cream)', fontWeight: 700 }}>{children}</strong>,
                em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
              },
              list: {
                bullet: ({ children }) => <ul style={{ paddingLeft: '24px', marginBottom: '20px' }}>{children}</ul>,
                number: ({ children }) => <ol style={{ paddingLeft: '24px', marginBottom: '20px' }}>{children}</ol>,
              },
              listItem: {
                bullet: ({ children }) => <li style={{ marginBottom: '8px' }}>{children}</li>,
                number: ({ children }) => <li style={{ marginBottom: '8px' }}>{children}</li>,
              },
            }}
          />
        ) : (
          <p style={{ color: 'rgba(245,237,224,0.4)' }}>No content.</p>
        )}
      </div>

      {/* Bottom share */}
      <div style={{ borderTop: '1px solid rgba(245,237,224,0.07)', paddingTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.2)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Share this article
        </p>
        <ShareButton
          title={article.title}
          text={article.excerpt}
          url={`${siteUrl}/articles/${slug}`}
        />
      </div>
    </main>
  )
}
