export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSanityClient } from '@/lib/sanity/client'
import { ARTICLE_BY_SLUG_QUERY } from '@/lib/sanity/queries'
import type { SanityArticle } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getSanityClient().fetch<SanityArticle>(ARTICLE_BY_SLUG_QUERY, { slug })
  if (!article) return { title: 'Not Found' }
  return {
    title: article.title,
    description: article.excerpt,
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getSanityClient().fetch<SanityArticle>(ARTICLE_BY_SLUG_QUERY, { slug })

  if (!article) notFound()

  return (
    <main className="min-h-screen px-6 py-24 max-w-2xl mx-auto">
      <p className="font-[var(--font-dm-mono)] text-[var(--gold)] text-xs tracking-[0.4em] uppercase mb-4">
        {article.category}
      </p>
      <h1 className="font-[var(--font-serif)] text-[var(--cream)] text-4xl font-bold leading-tight mb-6">
        {article.title}
      </h1>
      <p className="font-[var(--font-dm-mono)] text-[var(--cream-dim)] text-xs tracking-widest mb-12">
        {new Date(article.published_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        })}
      </p>
      {/* TODO: render article.body with Portable Text */}
      <p className="text-[var(--cream-dim)]">Article body coming soon.</p>
    </main>
  )
}
