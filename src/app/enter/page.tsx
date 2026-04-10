export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSanityClient } from '@/lib/sanity/client'
import { DROP_BY_SLUG_QUERY } from '@/lib/sanity/queries'
import EntryConfirm from '@/components/EntryConfirm'
import type { SanityDrop } from '@/types'

export const metadata: Metadata = { title: 'Enter' }

export default async function EnterPage({
  searchParams,
}: {
  searchParams: Promise<{ drop?: string; spots?: string; code?: string; id?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/?auth=required')

  const { drop: slug, spots, code, id } = await searchParams

  if (!slug || !id) redirect('/')

  const spotsCount = Math.min(2, Math.max(1, parseInt(spots ?? '1')))

  // Fetch drop name + price from Sanity for display
  const sanityDrop = await getSanityClient().fetch<SanityDrop>(DROP_BY_SLUG_QUERY, { slug })

  if (!sanityDrop) redirect('/')

  // Verify drop is still active in Supabase
  const { data: liveDrop } = await supabase
    .from('drops')
    .select('status, spots_sold, total_spots')
    .eq('id', id)
    .single()

  if (!liveDrop || liveDrop.status !== 'active') redirect(`/drops/${slug}`)

  const spotsRemaining = liveDrop.total_spots - liveDrop.spots_sold
  if (spotsRemaining < spotsCount) redirect(`/drops/${slug}`)

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <EntryConfirm
        dropId={id}
        dropSlug={slug}
        spots={spotsCount}
        code={code}
        entryPrice={sanityDrop.entry_price}
        itemName={sanityDrop.item_name}
      />
    </main>
  )
}
