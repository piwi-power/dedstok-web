'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthForm({ redirectTo }: { redirectTo?: string }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const callbackUrl = `${window.location.origin}/api/auth/callback${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ''}`

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl },
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-3">
        <p
          style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.3em' }}
          className="text-[var(--gold)] text-[10px] uppercase"
        >
          Check your inbox
        </p>
        <p className="text-[var(--cream-dim)] text-sm">
          Magic link sent to <span className="text-[var(--cream)]">{email}</span>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-sm mx-auto">
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ fontFamily: 'var(--font-dm-mono)' }}
        className="w-full bg-transparent border border-[var(--gold-dim)] text-[var(--cream)] placeholder-[var(--cream-dim)] px-4 py-3 text-sm rounded focus:outline-none focus:border-[var(--gold)] transition-colors"
      />
      {error && (
        <p className="text-red-400 text-xs text-center">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
        className="w-full bg-[var(--gold)] hover:bg-[var(--gold-light)] disabled:opacity-50 text-[var(--bg)] text-xs uppercase py-3 rounded transition-colors"
      >
        {loading ? 'Sending...' : 'Get Access'}
      </button>
    </form>
  )
}
