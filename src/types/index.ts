// ── Drop ─────────────────────────────────────────────────────
export type DropStatus = 'scheduled' | 'active' | 'closed' | 'drawn'
export type SourcingTier = 'A' | 'B' | 'C'

export interface Drop {
  id: string
  slug: string
  item_name: string
  description: string
  image_url: string
  market_value: number       // StockX / resell value in USD
  entry_price: number        // Price per spot in USD
  total_spots: number        // Max spots for this drop
  spots_sold: number         // How many have been purchased
  draw_date: string          // ISO timestamp — Saturday 23:59
  winner_id: string | null
  sourcing_tier: SourcingTier  // Internal only, never displayed
  status: DropStatus
  created_at: string
}

// ── Entry ─────────────────────────────────────────────────────
export interface Entry {
  id: string
  drop_id: string
  user_id: string
  spots_count: number        // 1 or 2 — hard cap
  total_paid: number         // spots_count * entry_price
  stripe_payment_id: string
  influencer_code: string | null
  created_at: string
}

// ── User ──────────────────────────────────────────────────────
export interface UserProfile {
  id: string
  email: string
  display_name: string | null
  phone: string | null       // Required for winner verification
  points_balance: number
  total_entries: number
  total_drops_entered: number
  streak_count: number       // Consecutive weekly entries
  created_at: string
}

// ── Winner ────────────────────────────────────────────────────
export interface Winner {
  id: string
  drop_id: string
  user_id: string
  entry_id: string
  announced_at: string
}

// ── Influencer Code ───────────────────────────────────────────
export interface InfluencerCode {
  id: string
  code: string
  influencer_name: string
  instagram_handle: string
  commission_per_ticket: number  // Fixed at $1.00
  total_uses: number
  total_earned: number
  is_active: boolean
  created_at: string
}

// ── Points Transaction ────────────────────────────────────────
export type PointsTxType = 'earned_entry' | 'earned_streak' | 'earned_milestone' | 'redeemed'

export interface PointsTransaction {
  id: string
  user_id: string
  type: PointsTxType
  amount: number
  drop_id: string | null
  created_at: string
}

// ── Sanity CMS types ─────────────────────────────────────────
export interface SanityDrop {
  _id: string
  slug: { current: string }
  item_name: string
  description: string
  images: SanityImage[]
  market_value: number
  entry_price: number
  total_spots: number
  draw_date: string
  sourcing_tier: SourcingTier
}

export interface SanityArticle {
  _id: string
  slug: { current: string }
  title: string
  excerpt: string
  body: unknown          // Portable Text blocks
  cover_image: SanityImage
  category: string
  author?: string
  published_at: string
}

export interface SanitySneakerWallItem {
  _id: string
  name: string
  brand: string
  year: number
  description: string
  image: SanityImage
  article_slug: string | null
}

export interface SanityImage {
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  alt?: string
}

// ── API response shapes ───────────────────────────────────────
export interface ApiResponse<T = null> {
  success: boolean
  data?: T
  error?: string
}

export interface EntryCheckoutResponse {
  checkout_url: string
  session_id: string
}
