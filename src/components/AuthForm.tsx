'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

// ── Floating label input ──────────────────────────────────────────────────────
function FloatingEmailInput({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  disabled: boolean
}) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0

  return (
    <div style={{ position: 'relative', paddingTop: '20px', marginBottom: '32px' }}>
      <label
        style={{
          position: 'absolute',
          left: 0,
          top: active ? '0px' : '24px',
          fontFamily: 'var(--font-dm-mono)',
          fontSize: active ? '9px' : '12px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: active ? 'var(--gold)' : 'rgba(245,237,224,0.35)',
          transition: 'top 180ms ease, font-size 180ms ease, color 180ms ease',
          pointerEvents: 'none',
          lineHeight: 1,
        }}
      >
        Email
      </label>
      <input
        type="email"
        required
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          borderBottom: `1px solid ${focused ? 'rgba(202,138,4,0.8)' : 'rgba(245,237,224,0.15)'}`,
          color: 'var(--cream)',
          fontFamily: 'var(--font-jost)',
          fontSize: '15px',
          padding: '8px 0',
          outline: 'none',
          transition: 'border-color 180ms ease',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AuthForm({
  redirectTo,
  referralCode,
  error: pageError,
}: {
  redirectTo?: string
  referralCode?: string
  error?: string
}) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(pageError ?? null)

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
  }

  // ── Sent state ──────────────────────────────────────────────────────────────
  if (sent) {
    return (
      <div>
        <p style={{
          fontFamily: 'var(--font-dm-mono)',
          color: 'var(--gold)',
          fontSize: '9px',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}>
          Check your inbox
        </p>
        <p style={{
          fontFamily: 'var(--font-jost)',
          color: 'rgba(245,237,224,0.55)',
          fontSize: '14px',
          lineHeight: 1.6,
        }}>
          Magic link sent to{' '}
          <span style={{ color: 'var(--cream)' }}>{email}</span>
        </p>
      </div>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', maxWidth: '360px' }}>

      {/* Google */}
      <button
        onClick={handleGoogle}
        disabled={googleLoading || loading}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '10px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--cream)',
          background: 'transparent',
          border: '1px solid rgba(245,237,224,0.15)',
          padding: '14px 20px',
          cursor: googleLoading || loading ? 'not-allowed' : 'pointer',
          opacity: googleLoading || loading ? 0.5 : 1,
          transition: 'border-color 200ms ease',
          marginBottom: '32px',
        }}
        onMouseEnter={e => {
          if (!googleLoading && !loading)
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,237,224,0.35)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,237,224,0.15)'
        }}
      >
        {/* Google G */}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {googleLoading ? 'Redirecting...' : 'Continue with Google'}
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(245,237,224,0.08)' }} />
        <span style={{
          fontFamily: 'var(--font-dm-mono)',
          color: 'rgba(245,237,224,0.25)',
          fontSize: '9px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          or
        </span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(245,237,224,0.08)' }} />
      </div>

      {/* Email form */}
      <form onSubmit={handleSubmit}>
        <FloatingEmailInput
          value={email}
          onChange={setEmail}
          disabled={loading || googleLoading}
        />

        {/* Error */}
        {error && (
          <div style={{
            borderLeft: '2px solid rgba(180,83,9,0.8)',
            paddingLeft: '10px',
            marginBottom: '20px',
          }}>
            <p style={{
              fontFamily: 'var(--font-dm-mono)',
              color: 'rgb(217,119,6)',
              fontSize: '10px',
              letterSpacing: '0.08em',
            }}>
              {error === '1' ? 'Authentication failed. Try again.' : error}
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || googleLoading}
          style={{
            width: '100%',
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '10px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#0c0a09',
            background: 'var(--gold)',
            border: 'none',
            padding: '16px 20px',
            cursor: loading || googleLoading ? 'not-allowed' : 'pointer',
            opacity: loading || googleLoading ? 0.6 : 1,
            transition: 'opacity 200ms ease, filter 200ms ease',
          }}
          onMouseEnter={e => {
            if (!loading && !googleLoading)
              (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.08)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1)'
          }}
        >
          {loading ? 'Sending...' : 'Get Magic Link'}
        </button>
      </form>
    </div>
  )
}
