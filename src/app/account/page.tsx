export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Account',
  description: 'Your entries, points, and drop history.',
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/?auth=required')

  // TODO: fetch user profile, entry history, points balance from Supabase

  return (
    <main className="min-h-screen px-6 py-24 max-w-4xl mx-auto">
      <p
        style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.4em' }}
        className="text-[var(--gold)] text-xs uppercase mb-4"
      >
        Account
      </p>
      <h1
        style={{ fontFamily: 'var(--font-serif)' }}
        className="text-[var(--cream)] text-5xl font-bold mb-2"
      >
        Your Profile
      </h1>
      <p className="text-[var(--cream-dim)] text-sm mb-12">{user.email}</p>

      <div className="grid grid-cols-3 gap-4 mb-16">
        {[
          { label: 'STOK Points', value: '0' },
          { label: 'Drops Entered', value: '0' },
          { label: 'Streak', value: '0 weeks' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--walnut)] border border-[var(--gold-dim)] p-6 rounded"
          >
            <p
              style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
              className="text-[var(--gold)] text-[10px] uppercase mb-2"
            >
              {stat.label}
            </p>
            <p
              style={{ fontFamily: 'var(--font-bebas)' }}
              className="text-[var(--cream)] text-4xl"
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <h2
        style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
        className="text-[var(--gold)] text-xs uppercase mb-6"
      >
        Entry History
      </h2>
      <p className="text-[var(--cream-dim)] text-sm">No entries yet.</p>
    </main>
  )
}
