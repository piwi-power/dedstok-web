export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EntryConfirm from '@/components/EntryConfirm'
import BackButton from '@/components/BackButton'

export const metadata: Metadata = { title: 'Enter' }

export default async function EnterPage({
  searchParams,
}: {
  searchParams: Promise<{ drop?: string; spots?: string; code?: string; id?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { drop: slug, spots, code, id } = await searchParams

  if (!slug || !id) redirect('/')

  const spotsCount = Math.min(2, Math.max(1, parseInt(spots ?? '1')))

  const [{ data: liveDrop }, { data: userRecord }] = await Promise.all([
    supabase
      .from('drops')
      .select('status, spots_sold, total_spots, item_name, entry_price')
      .eq('id', id)
      .single(),
    supabase
      .from('users')
      .select('points_balance, phone_verified')
      .eq('id', user.id)
      .single(),
  ])

  // Phone gate — redirect before rendering anything
  if (!userRecord?.phone_verified) {
    const returnUrl = `/enter?drop=${slug}&spots=${spotsCount}&id=${id}${code ? `&code=${code}` : ''}`
    redirect(`/account/verify-phone?return=${encodeURIComponent(returnUrl)}`)
  }

  if (!liveDrop || liveDrop.status !== 'active') redirect(`/drops/${slug}`)

  const spotsRemaining = liveDrop.total_spots - liveDrop.spots_sold
  if (spotsRemaining < spotsCount) redirect(`/drops/${slug}`)

  const pointsBalance = userRecord?.points_balance ?? 0

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '96px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <BackButton href="/drops" />
        <EntryConfirm
          dropId={id}
          dropSlug={slug}
          spots={spotsCount}
          code={code}
          entryPrice={liveDrop.entry_price}
          itemName={liveDrop.item_name}
          pointsBalance={pointsBalance}
        />
      </div>
    </main>
  )
}
