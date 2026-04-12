import { groq } from 'next-sanity'

// ── Drops ─────────────────────────────────────────────────────

export const ACTIVE_DROP_QUERY = groq`
  *[_type == "drop" && status == "active"][0] {
    _id,
    slug,
    item_name,
    description,
    images,
    market_value,
    entry_price,
    total_spots,
    draw_date,
    sourcing_tier
  }
`

export const DROP_BY_SLUG_QUERY = groq`
  *[_type == "drop" && slug.current == $slug][0] {
    _id,
    slug,
    item_name,
    description,
    images,
    market_value,
    entry_price,
    total_spots,
    draw_date,
    sourcing_tier
  }
`

export const ALL_DROP_SLUGS_QUERY = groq`
  *[_type == "drop"] { "slug": slug.current }
`

// ── Articles ──────────────────────────────────────────────────

export const ALL_ARTICLES_QUERY = groq`
  *[_type == "article"] | order(published_at desc) {
    _id,
    slug,
    title,
    excerpt,
    cover_image,
    category,
    published_at
  }
`

export const ARTICLE_BY_SLUG_QUERY = groq`
  *[_type == "article" && slug.current == $slug][0] {
    _id,
    slug,
    title,
    excerpt,
    body,
    cover_image,
    category,
    author,
    published_at
  }
`

export const ALL_ARTICLE_SLUGS_QUERY = groq`
  *[_type == "article"] { "slug": slug.current }
`

// ── Sneaker Wall ──────────────────────────────────────────────

export const SNEAKER_WALL_QUERY = groq`
  *[_type == "sneakerWallItem"] | order(_createdAt asc) {
    _id,
    name,
    brand,
    year,
    description,
    image,
    "article_slug": article->slug.current
  }
`
