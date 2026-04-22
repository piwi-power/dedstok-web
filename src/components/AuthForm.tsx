'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import { COUNTRIES, detectCountryCode, getCountry, toE164, type Country } from '@/lib/countries'

// ── Helpers ───────────────────────────────────────────────────────────────────

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: 'transparent' }
  let s = 0
  if (pw.length >= 6) s++
  if (pw.length >= 10) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  if (s <= 1) return { score: s, label: 'Weak', color: '#ef4444' }
  if (s === 2) return { score: s, label: 'Fair', color: '#f59e0b' }
  if (s === 3) return { score: s, label: 'Good', color: '#ca8a04' }
  return { score: s, label: 'Strong', color: '#22c55e' }
}

const USERNAME_RE = /^[a-z0-9_]{3,20}$/

// ── Floating label input ──────────────────────────────────────────────────────

function FloatingInput({
  label,
  value,
  onChange,
  type = 'text',
  disabled,
  autoComplete,
  hint,
  hintColor,
  suffix,
  onBlur,
  inputMode,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  disabled?: boolean
  autoComplete?: string
  hint?: string
  hintColor?: string
  suffix?: React.ReactNode
  onBlur?: () => void
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
}) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0

  return (
    <div style={{ position: 'relative', paddingTop: '20px', marginBottom: hint ? '20px' : '28px' }}>
      <label style={{
        position: 'absolute', left: 0, top: active ? '0px' : '24px',
        fontFamily: 'var(--font-dm-mono)', fontSize: active ? '9px' : '12px',
        letterSpacing: '0.15em', textTransform: 'uppercase',
        color: active ? 'var(--gold)' : 'rgba(245,237,224,0.35)',
        transition: 'top 180ms ease, font-size 180ms ease, color 180ms ease',
        pointerEvents: 'none', lineHeight: 1,
      }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.() }}
          disabled={disabled}
          autoComplete={autoComplete}
          inputMode={inputMode}
          style={{
            flex: 1, background: 'transparent', border: 'none',
            borderBottom: `1px solid ${focused ? 'rgba(202,138,4,0.8)' : 'rgba(245,237,224,0.15)'}`,
            color: 'var(--cream)', fontFamily: 'var(--font-jost)', fontSize: '15px',
            padding: '8px 0', outline: 'none', transition: 'border-color 180ms ease',
            width: '100%', boxSizing: 'border-box',
          }}
        />
        {suffix}
      </div>
      {hint && (
        <p style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.08em',
          color: hintColor ?? 'rgba(245,237,224,0.35)', marginTop: '5px',
        }}>
          {hint}
        </p>
      )}
    </div>
  )
}

// ── Eye toggle for password ───────────────────────────────────────────────────

function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'rgba(245,237,224,0.35)', padding: '0 0 0 8px', flexShrink: 0,
        display: 'flex', alignItems: 'center',
      }}
    >
      {show ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  )
}

// ── Password strength bar ─────────────────────────────────────────────────────

function StrengthBar({ password }: { password: string }) {
  const { score, label, color } = passwordStrength(password)
  if (!password) return null
  const segments = 4
  const filled = Math.min(Math.ceil((score / 5) * segments), segments)

  return (
    <div style={{ marginTop: '-12px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1, height: '2px', borderRadius: '1px',
              background: i < filled ? color : 'rgba(245,237,224,0.1)',
              transition: 'background 300ms ease',
            }}
          />
        ))}
      </div>
      <p style={{
        fontFamily: 'var(--font-dm-mono)', fontSize: '9px',
        letterSpacing: '0.12em', color,
      }}>
        {label}
      </p>
    </div>
  )
}

// ── Country picker modal ──────────────────────────────────────────────────────

function CountryModal({
  open,
  onClose,
  onSelect,
  current,
}: {
  open: boolean
  onClose: () => void
  onSelect: (country: Country) => void
  current: Country
}) {
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setSearch('')
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open])

  const filtered = search
    ? COUNTRIES.filter(
        c =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dial.includes(search) ||
          c.code.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRIES

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(10,8,4,0.85)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0c0a09', border: '1px solid rgba(245,237,224,0.1)',
          borderRadius: '4px 4px 0 0',
          width: '100%', maxWidth: '480px',
          maxHeight: '70vh', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 0', borderBottom: '1px solid rgba(245,237,224,0.08)',
          paddingBottom: '16px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <p style={{
              fontFamily: 'var(--font-dm-mono)', fontSize: '9px',
              letterSpacing: '0.3em', textTransform: 'uppercase',
              color: 'rgba(245,237,224,0.35)',
            }}>
              Country Code
            </p>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,237,224,0.35)', display: 'flex', alignItems: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <input
            ref={inputRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search countries..."
            style={{
              width: '100%', background: 'rgba(245,237,224,0.05)',
              border: '1px solid rgba(245,237,224,0.1)',
              color: 'var(--cream)', fontFamily: 'var(--font-jost)',
              fontSize: '14px', padding: '10px 14px', outline: 'none',
              borderRadius: '2px', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Country list */}
        <div style={{ overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>
          {filtered.map(country => (
            <button
              key={country.code}
              onClick={() => { onSelect(country); onClose() }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 20px', background: country.code === current.code ? 'rgba(202,138,4,0.08)' : 'none',
                border: 'none', borderBottom: '1px solid rgba(245,237,224,0.04)',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '20px', lineHeight: 1, flexShrink: 0 }}>{country.flag}</span>
              <span style={{ fontFamily: 'var(--font-jost)', fontSize: '14px', color: 'var(--cream)', flex: 1 }}>
                {country.name}
              </span>
              <span style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
                color: country.code === current.code ? 'var(--gold)' : 'rgba(245,237,224,0.4)',
                flexShrink: 0,
              }}>
                {country.dial}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p style={{ padding: '32px', textAlign: 'center', color: 'rgba(245,237,224,0.3)', fontFamily: 'var(--font-jost)', fontSize: '13px' }}>
              No results
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── OTP digit inputs ──────────────────────────────────────────────────────────

function OtpInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.padEnd(6, '').slice(0, 6).split('')

  function handleChange(i: number, char: string) {
    const cleaned = char.replace(/\D/g, '').slice(-1)
    const next = digits.map((d, idx) => idx === i ? cleaned : d).join('').slice(0, 6)
    onChange(next)
    if (cleaned && i < 5) refs.current[i + 1]?.focus()
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(text)
    const focusIdx = Math.min(text.length, 5)
    refs.current[focusIdx]?.focus()
  }

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '32px' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] ?? ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          style={{
            width: '44px', height: '52px', textAlign: 'center',
            background: 'rgba(245,237,224,0.04)',
            border: `1px solid ${digits[i] ? 'rgba(202,138,4,0.5)' : 'rgba(245,237,224,0.12)'}`,
            borderRadius: '2px', color: 'var(--cream)',
            fontFamily: 'var(--font-dm-mono)', fontSize: '20px',
            outline: 'none', transition: 'border-color 150ms ease',
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  )
}

// ── Error block ───────────────────────────────────────────────────────────────

function ErrorBlock({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div style={{ borderLeft: '2px solid rgba(180,83,9,0.8)', paddingLeft: '10px', marginBottom: '20px' }}>
      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgb(217,119,6)', fontSize: '10px', letterSpacing: '0.08em' }}>
        {message}
      </p>
    </div>
  )
}

// ── Tab button ────────────────────────────────────────────────────────────────

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1, background: 'none', border: 'none', borderBottom: `2px solid ${active ? 'var(--gold)' : 'rgba(245,237,224,0.1)'}`,
        color: active ? 'var(--cream)' : 'rgba(245,237,224,0.35)',
        fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '0.22em',
        textTransform: 'uppercase', padding: '0 0 14px', cursor: 'pointer',
        transition: 'color 180ms ease, border-color 180ms ease',
      }}
    >
      {label}
    </button>
  )
}

// ── Gold submit button ────────────────────────────────────────────────────────

function GoldButton({ children, loading, disabled }: { children: React.ReactNode; loading?: boolean; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      style={{
        width: '100%', fontFamily: 'var(--font-dm-mono)', fontSize: '10px',
        letterSpacing: '0.22em', textTransform: 'uppercase',
        color: '#0c0a09', background: 'var(--gold)', border: 'none',
        padding: '16px 20px', cursor: loading || disabled ? 'not-allowed' : 'pointer',
        opacity: loading || disabled ? 0.6 : 1, transition: 'opacity 200ms ease, filter 200ms ease',
        borderRadius: '2px',
      }}
      onMouseEnter={e => { if (!loading && !disabled) (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.08)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1)' }}
    >
      {children}
    </button>
  )
}

// ── Google button ─────────────────────────────────────────────────────────────

function GoogleButton({ loading, disabled, onClick }: { loading: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
        fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase',
        color: 'var(--cream)', background: 'transparent', border: '1px solid rgba(245,237,224,0.15)',
        padding: '14px 20px', cursor: loading || disabled ? 'not-allowed' : 'pointer',
        opacity: loading || disabled ? 0.5 : 1, transition: 'border-color 200ms ease',
        borderRadius: '2px',
      }}
      onMouseEnter={e => { if (!loading && !disabled) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,237,224,0.35)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,237,224,0.15)' }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      {loading ? 'Redirecting...' : 'Continue with Google'}
    </button>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────

function OrDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
      <div style={{ flex: 1, height: '1px', background: 'rgba(245,237,224,0.08)' }} />
      <span style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.25)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        or
      </span>
      <div style={{ flex: 1, height: '1px', background: 'rgba(245,237,224,0.08)' }} />
    </div>
  )
}

// ── Main AuthForm ─────────────────────────────────────────────────────────────

export default function AuthForm({
  redirectTo = '/',
  defaultTab = 'signin',
  error: pageError,
}: {
  redirectTo?: string
  defaultTab?: 'signin' | 'signup'
  error?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(pageError ?? null)

  // ── Sign in state ─────────────────────────────────────────────────────────
  const [identifier, setIdentifier] = useState('')
  const [siPassword, setSiPassword] = useState('')
  const [showSiPw, setShowSiPw] = useState(false)

  // ── Sign up state ─────────────────────────────────────────────────────────
  const [signupStep, setSignupStep] = useState<'form' | 'otp'>('form')
  const [suEmail, setSuEmail] = useState('')
  const [suUsername, setSuUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [suPassword, setSuPassword] = useState('')
  const [suConfirm, setSuConfirm] = useState('')
  const [showSuPw, setShowSuPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  // Phone
  const [country, setCountry] = useState<Country>(() => getCountry('LB'))
  const [localPhone, setLocalPhone] = useState('')
  const [countryModalOpen, setCountryModalOpen] = useState(false)

  // Referral
  const [referralCode, setReferralCode] = useState('')
  const [refLocked, setRefLocked] = useState(false) // true when pre-filled from URL

  // OTP
  const [otp, setOtp] = useState('')
  const [maskedPhone, setMaskedPhone] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)

  // Auto-detect country + read referral param on mount
  useEffect(() => {
    setCountry(getCountry(detectCountryCode()))
    const ref = searchParams.get('ref')
    if (ref) {
      setReferralCode(ref.toUpperCase())
      setRefLocked(true)
    }
  }, [searchParams])

  // Resend countdown
  useEffect(() => {
    if (resendCountdown <= 0) return
    const t = setTimeout(() => setResendCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCountdown])

  // Username availability check (debounced)
  const checkUsername = useCallback(async (username: string) => {
    if (!username) { setUsernameStatus('idle'); return }
    if (!USERNAME_RE.test(username)) { setUsernameStatus('invalid'); return }
    setUsernameStatus('checking')
    try {
      const res = await fetch(`/api/auth/check-username?u=${encodeURIComponent(username)}`)
      const data = await res.json()
      if (data.error && data.error.includes('only contain')) {
        setUsernameStatus('invalid')
      } else {
        setUsernameStatus(data.available ? 'available' : 'taken')
      }
    } catch {
      setUsernameStatus('idle')
    }
  }, [])

  const usernameHint = {
    idle: undefined,
    checking: { text: 'Checking...', color: 'rgba(245,237,224,0.35)' },
    available: { text: 'Available', color: '#22c55e' },
    taken: { text: 'Username taken', color: '#ef4444' },
    invalid: { text: 'Letters, numbers, underscores only (3-20 characters)', color: '#ef4444' },
  }[usernameStatus]

  const pwStrength = passwordStrength(suPassword)
  const pwMatch = suConfirm.length > 0 && suPassword === suConfirm

  function switchTab(t: 'signin' | 'signup') {
    setTab(t)
    setError(null)
    setSignupStep('form')
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────

  async function handleGoogle() {
    setGoogleLoading(true)
    setError(null)
    const callbackUrl = new URL(`${window.location.origin}/api/auth/callback`)
    callbackUrl.searchParams.set('next', redirectTo)
    if (referralCode) callbackUrl.searchParams.set('ref', referralCode)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl.toString() },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  // ── Sign in ───────────────────────────────────────────────────────────────

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Resolve identifier → email
    const res = await fetch('/api/auth/resolve-identifier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    })
    const resolved = await res.json()

    if (!res.ok || !resolved.email) {
      setError(resolved.error ?? 'No account found with that email, username, or number')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: resolved.email,
      password: siPassword,
    })

    setLoading(false)
    if (error) {
      setError('Incorrect password. Try again.')
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  // ── Sign up step 1: send OTP ──────────────────────────────────────────────

  async function handleSignupSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!suEmail || !suEmail.includes('@')) { setError('Enter a valid email address'); return }
    if (!suUsername || !USERNAME_RE.test(suUsername)) { setError('Username must be 3-20 characters, letters, numbers, and underscores only'); return }
    if (usernameStatus === 'taken') { setError('Username is taken. Choose another.'); return }
    if (usernameStatus === 'invalid') { setError('Invalid username format'); return }
    if (!localPhone) { setError('Enter your phone number'); return }
    if (suPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    if (suPassword.length > 20) { setError('Password must be at most 20 characters'); return }
    if (suPassword !== suConfirm) { setError('Passwords do not match'); return }

    setLoading(true)
    const phone = toE164(country.dial, localPhone)
    const res = await fetch('/api/auth/send-signup-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok || !data.success) {
      setError(data.error ?? 'Failed to send code')
      return
    }

    setMaskedPhone(data.maskedPhone ?? phone)
    setSignupStep('otp')
    setResendCountdown(60)
  }

  // ── Sign up step 2: verify OTP + create account ───────────────────────────

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length < 6) { setError('Enter the 6-digit code'); return }
    setLoading(true)
    setError(null)

    const phone = toE164(country.dial, localPhone)
    const res = await fetch('/api/auth/complete-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: suEmail, username: suUsername, phone, password: suPassword, code: otp, referralCode: referralCode || undefined }),
    })
    const data = await res.json()

    if (!res.ok || !data.success) {
      setLoading(false)
      setError(data.error ?? 'Verification failed')
      return
    }

    // Sign in immediately using the credentials we already have
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: suPassword,
    })

    setLoading(false)
    if (signInErr) {
      setError('Account created. Please sign in.')
      setTab('signin')
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────

  async function handleResend() {
    if (resendCountdown > 0) return
    setResendCountdown(60)
    setOtp('')
    setError(null)
    const phone = toE164(country.dial, localPhone)
    await fetch('/api/auth/send-signup-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
  }

  const disabled = loading || googleLoading

  // ── OTP step ──────────────────────────────────────────────────────────────

  if (tab === 'signup' && signupStep === 'otp') {
    return (
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Verify your number
        </p>
        <p style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.55)', fontSize: '14px', lineHeight: 1.6, marginBottom: '36px' }}>
          Code sent to{' '}
          <span style={{ color: 'var(--cream)' }}>{maskedPhone}</span>
        </p>

        <form onSubmit={handleOtpSubmit}>
          <OtpInput value={otp} onChange={setOtp} disabled={disabled} />
          <ErrorBlock message={error} />
          <GoldButton loading={loading}>Verify and create account</GoldButton>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
          <button
            type="button"
            onClick={() => { setSignupStep('form'); setOtp(''); setError(null) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,237,224,0.35)' }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCountdown > 0}
            style={{
              background: 'none', border: 'none', cursor: resendCountdown > 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', color: resendCountdown > 0 ? 'rgba(245,237,224,0.25)' : 'rgba(245,237,224,0.55)',
            }}
          >
            {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend code'}
          </button>
        </div>
      </div>
    )
  }

  // ── Main form ─────────────────────────────────────────────────────────────

  return (
    <div style={{ width: '100%', maxWidth: '360px' }}>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '36px' }}>
        <TabBtn label="Sign In" active={tab === 'signin'} onClick={() => switchTab('signin')} />
        <TabBtn label="Create Account" active={tab === 'signup'} onClick={() => switchTab('signup')} />
      </div>

      {/* Google */}
      <GoogleButton loading={googleLoading} disabled={disabled} onClick={handleGoogle} />
      <OrDivider />

      {/* ── Sign In form ── */}
      {tab === 'signin' && (
        <form onSubmit={handleSignIn}>
          <FloatingInput
            label="Email, username, or phone"
            value={identifier}
            onChange={setIdentifier}
            disabled={disabled}
            autoComplete="username"
          />
          <FloatingInput
            label="Password"
            value={siPassword}
            onChange={setSiPassword}
            type={showSiPw ? 'text' : 'password'}
            disabled={disabled}
            autoComplete="current-password"
            suffix={<EyeToggle show={showSiPw} onToggle={() => setShowSiPw(v => !v)} />}
          />
          <ErrorBlock message={error} />
          <GoldButton loading={loading}>Sign In</GoldButton>
        </form>
      )}

      {/* ── Sign Up form ── */}
      {tab === 'signup' && (
        <form onSubmit={handleSignupSubmit}>
          <FloatingInput
            label="Email"
            value={suEmail}
            onChange={setSuEmail}
            type="email"
            disabled={disabled}
            autoComplete="email"
          />

          <FloatingInput
            label="Username"
            value={suUsername}
            onChange={v => {
              setSuUsername(v.toLowerCase())
              setUsernameStatus('idle')
            }}
            disabled={disabled}
            autoComplete="username"
            hint={usernameHint?.text}
            hintColor={usernameHint?.color}
            onBlur={() => checkUsername(suUsername)}
          />

          {/* Phone field */}
          <div style={{ position: 'relative', paddingTop: '20px', marginBottom: '28px' }}>
            <label style={{
              position: 'absolute', left: 0, top: '0px',
              fontFamily: 'var(--font-dm-mono)', fontSize: '9px',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: 'var(--gold)', lineHeight: 1, pointerEvents: 'none',
            }}>
              Phone
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
              {/* Country selector */}
              <button
                type="button"
                onClick={() => setCountryModalOpen(true)}
                disabled={disabled}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'none', border: 'none',
                  borderBottom: '1px solid rgba(245,237,224,0.15)',
                  padding: '8px 0', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: '18px', lineHeight: 1 }}>{country.flag}</span>
                <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'rgba(245,237,224,0.7)', letterSpacing: '0.05em' }}>
                  {country.dial}
                </span>
                <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M1 1L4 4L7 1" stroke="rgba(245,237,224,0.35)" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
              {/* Local number */}
              <input
                type="tel"
                inputMode="numeric"
                value={localPhone}
                onChange={e => setLocalPhone(e.target.value.replace(/[^\d\s\-()]/g, ''))}
                disabled={disabled}
                placeholder="70 123 456"
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  borderBottom: '1px solid rgba(245,237,224,0.15)',
                  color: 'var(--cream)', fontFamily: 'var(--font-jost)', fontSize: '15px',
                  padding: '8px 0', outline: 'none', minWidth: 0,
                }}
              />
            </div>
          </div>

          <FloatingInput
            label="Password"
            value={suPassword}
            onChange={setSuPassword}
            type={showSuPw ? 'text' : 'password'}
            disabled={disabled}
            autoComplete="new-password"
            suffix={<EyeToggle show={showSuPw} onToggle={() => setShowSuPw(v => !v)} />}
          />
          <StrengthBar password={suPassword} />

          <FloatingInput
            label="Confirm Password"
            value={suConfirm}
            onChange={setSuConfirm}
            type={showConfirmPw ? 'text' : 'password'}
            disabled={disabled}
            autoComplete="new-password"
            hint={suConfirm.length > 0 ? (pwMatch ? 'Passwords match' : 'Passwords do not match') : undefined}
            hintColor={suConfirm.length > 0 ? (pwMatch ? '#22c55e' : '#ef4444') : undefined}
            suffix={<EyeToggle show={showConfirmPw} onToggle={() => setShowConfirmPw(v => !v)} />}
          />

          {/* Referral code — optional, locked if from URL */}
          <div style={{ position: 'relative', paddingTop: '20px', marginBottom: '28px' }}>
            <label style={{
              position: 'absolute', left: 0, top: '0px',
              fontFamily: 'var(--font-dm-mono)', fontSize: '9px',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: refLocked ? 'var(--gold)' : 'rgba(245,237,224,0.35)',
              lineHeight: 1, pointerEvents: 'none',
            }}>
              Referral Code{!refLocked && ' (optional)'}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
              <input
                type="text"
                value={referralCode}
                onChange={e => !refLocked && setReferralCode(e.target.value.toUpperCase())}
                readOnly={refLocked}
                placeholder={refLocked ? '' : 'Enter code if you have one'}
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  borderBottom: `1px solid ${refLocked ? 'rgba(202,138,4,0.4)' : 'rgba(245,237,224,0.15)'}`,
                  color: refLocked ? 'var(--gold)' : 'var(--cream)',
                  fontFamily: 'var(--font-dm-mono)', fontSize: '13px',
                  letterSpacing: refLocked ? '0.15em' : '0.05em',
                  padding: '8px 0', outline: 'none', boxSizing: 'border-box',
                  cursor: refLocked ? 'default' : 'text',
                }}
              />
              {refLocked && (
                <span style={{
                  fontFamily: 'var(--font-dm-mono)', fontSize: '9px',
                  letterSpacing: '0.1em', color: 'rgba(202,138,4,0.6)',
                  marginLeft: '8px', flexShrink: 0,
                }}>
                  Locked
                </span>
              )}
            </div>
          </div>

          <ErrorBlock message={error} />
          <GoldButton loading={loading} disabled={usernameStatus === 'checking'}>
            {loading ? 'Sending code...' : 'Continue'}
          </GoldButton>
        </form>
      )}

      {/* Country picker modal */}
      <CountryModal
        open={countryModalOpen}
        onClose={() => setCountryModalOpen(false)}
        onSelect={setCountry}
        current={country}
      />
    </div>
  )
}
