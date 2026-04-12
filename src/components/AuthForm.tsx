'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthForm({ redirectTo, referralCode }: { redirectTo?: string; referralCode?: string }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const callbackUrl = (origin: string) => {
    const url = new URL(`${origin}/api/auth/callback`)
    if (redirectTo) url.searchParams.set('next', redirectTo)
    if (referralCode) url.searchParams.set('ref', referralCode)
    return url.toString()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl(window.location.origin) },
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl(window.location.origin) },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
    // On success, browser redirects — no need to reset loading
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
    <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
      {/* Google OAuth */}
      <button
        onClick={handleGoogle}
        disabled={googleLoading || loading}
        style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.1em' }}
        className="w-full flex items-center justify-center gap-3 border border-[var(--gold-dim)] hover:border-[var(--gold)] disabled:opacity-50 text-[var(--cream)] text-xs uppercase py-3 rounded transition-colors"
      >
        {!googleLoading && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        {googleLoading ? 'Redirecting...' : 'Continue with Google'}
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(245,237,224,0.1)' }} />
        <span style={{ color: 'rgba(245,237,224,0.25)', fontSize: '11px', fontFamily: 'var(--font-dm-mono)' }}>or</span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(245,237,224,0.1)' }} />
      </div>

      {/* Magic link */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
          disabled={loading || googleLoading}
          style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
          className="w-full bg-[var(--gold)] hover:bg-[var(--gold-light)] disabled:opacity-50 text-[var(--bg)] text-xs uppercase py-3 rounded transition-colors"
        >
          {loading ? 'Sending...' : 'Get Magic Link'}
        </button>
      </form>
    </div>
  )
}
