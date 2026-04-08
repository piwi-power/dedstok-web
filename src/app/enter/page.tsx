export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Enter',
}

// Entry is initiated from the drop page / raffle case
// This page handles the post-auth redirect and Stripe checkout continuation
export default async function EnterPage({
  searchParams,
}: {
  searchParams: Promise<{ drop?: string; spots?: string; code?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/?auth=required')

  const { drop, spots, code } = await searchParams

  if (!drop) redirect('/')

  // TODO: validate drop is active, check 2-spot cap, initiate Stripe checkout

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-[var(--walnut)] border border-[var(--gold-dim)] rounded p-8">
        <p
          style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.3em' }}
          className="text-[var(--gold)] text-[10px] uppercase mb-6"
        >
          Confirm Entry
        </p>
        <p className="text-[var(--cream-dim)] text-sm mb-8">
          Drop: <span className="text-[var(--cream)]">{drop}</span>
          <br />
          Spots: <span className="text-[var(--cream)]">{spots ?? 1}</span>
          {code && (
            <>
              <br />
              Code: <span className="text-[var(--gold)]">{code}</span>
            </>
          )}
        </p>
        {/* TODO: wire to /api/enter */}
        <button className="w-full bg-[var(--gold)] hover:bg-[var(--gold-light)] text-[var(--bg)] font-semibold py-4 rounded-full transition-colors">
          Proceed to Payment
        </button>
      </div>
    </main>
  )
}
