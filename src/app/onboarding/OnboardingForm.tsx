'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { COUNTRIES, detectCountryCode, getCountry, toE164, type Country } from '@/lib/countries'

const USERNAME_RE = /^[a-z0-9_]{3,20}$/

// ── Floating input ─────────────────────────────────────────────────────────────

function FloatingInput({
  label, value, onChange, disabled, hint, hintColor, onBlur,
}: {
  label: string; value: string; onChange: (v: string) => void
  disabled?: boolean; hint?: string; hintColor?: string; onBlur?: () => void
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
      }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); onBlur?.() }}
        disabled={disabled}
        style={{
          width: '100%', background: 'transparent', border: 'none',
          borderBottom: `1px solid ${focused ? 'rgba(202,138,4,0.8)' : 'rgba(245,237,224,0.15)'}`,
          color: 'var(--cream)', fontFamily: 'var(--font-jost)', fontSize: '15px',
          padding: '8px 0', outline: 'none', boxSizing: 'border-box',
        }}
      />
      {hint && <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.08em', color: hintColor ?? 'rgba(245,237,224,0.35)', marginTop: '5px' }}>{hint}</p>}
    </div>
  )
}

// ── OTP inputs ────────────────────────────────────────────────────────────────

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
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }
  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(text)
    refs.current[Math.min(text.length, 5)]?.focus()
  }
  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '32px' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input key={i} ref={el => { refs.current[i] = el }} type="text" inputMode="numeric" maxLength={1}
          value={digits[i] ?? ''} onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)} onPaste={handlePaste} disabled={disabled}
          style={{
            width: '44px', height: '52px', textAlign: 'center',
            background: 'rgba(245,237,224,0.04)',
            border: `1px solid ${digits[i] ? 'rgba(202,138,4,0.5)' : 'rgba(245,237,224,0.12)'}`,
            borderRadius: '2px', color: 'var(--cream)', fontFamily: 'var(--font-dm-mono)',
            fontSize: '20px', outline: 'none', flexShrink: 0,
          }}
        />
      ))}
    </div>
  )
}

// ── Country modal (inline minimal version) ────────────────────────────────────

function CountryModal({ open, onClose, onSelect, current }: {
  open: boolean; onClose: () => void; onSelect: (c: Country) => void; current: Country
}) {
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (open) { setSearch(''); setTimeout(() => inputRef.current?.focus(), 80) } }, [open])
  const filtered = search ? COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search)
  ) : COUNTRIES
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10,8,4,0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0c0a09', border: '1px solid rgba(245,237,224,0.1)', borderRadius: '4px 4px 0 0', width: '100%', maxWidth: '480px', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(245,237,224,0.08)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(245,237,224,0.35)' }}>Country Code</p>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,237,224,0.35)', display: 'flex', alignItems: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>
          <input ref={inputRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search countries..."
            style={{ width: '100%', background: 'rgba(245,237,224,0.05)', border: '1px solid rgba(245,237,224,0.1)', color: 'var(--cream)', fontFamily: 'var(--font-jost)', fontSize: '14px', padding: '10px 14px', outline: 'none', borderRadius: '2px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>
          {filtered.map(c => (
            <button key={c.code} onClick={() => { onSelect(c); onClose() }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', background: c.code === current.code ? 'rgba(202,138,4,0.08)' : 'none', border: 'none', borderBottom: '1px solid rgba(245,237,224,0.04)', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ fontSize: '20px', lineHeight: 1, flexShrink: 0 }}>{c.flag}</span>
              <span style={{ fontFamily: 'var(--font-jost)', fontSize: '14px', color: 'var(--cream)', flex: 1 }}>{c.name}</span>
              <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: c.code === current.code ? 'var(--gold)' : 'rgba(245,237,224,0.4)', flexShrink: 0 }}>{c.dial}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function OnboardingForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [country, setCountry] = useState<Country>(() => getCountry('LB'))
  const [localPhone, setLocalPhone] = useState('')
  const [countryModalOpen, setCountryModalOpen] = useState(false)
  const [otp, setOtp] = useState('')
  const [maskedPhone, setMaskedPhone] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)

  useEffect(() => { setCountry(getCountry(detectCountryCode())) }, [])
  useEffect(() => {
    if (resendCountdown <= 0) return
    const t = setTimeout(() => setResendCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCountdown])

  const checkUsername = useCallback(async (u: string) => {
    if (!u) { setUsernameStatus('idle'); return }
    if (!USERNAME_RE.test(u)) { setUsernameStatus('invalid'); return }
    setUsernameStatus('checking')
    const res = await fetch(`/api/auth/check-username?u=${encodeURIComponent(u)}`)
    const data = await res.json()
    setUsernameStatus(data.available ? 'available' : 'taken')
  }, [])

  const usernameHint = {
    idle: undefined,
    checking: { text: 'Checking...', color: 'rgba(245,237,224,0.35)' },
    available: { text: 'Available', color: '#22c55e' },
    taken: { text: 'Username taken', color: '#ef4444' },
    invalid: { text: 'Letters, numbers, underscores only (3-20 characters)', color: '#ef4444' },
  }[usernameStatus]

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!username || !USERNAME_RE.test(username)) { setError('Invalid username'); return }
    if (usernameStatus === 'taken') { setError('Username is taken'); return }
    if (!localPhone) { setError('Enter your phone number'); return }
    setLoading(true)
    const phone = toE164(country.dial, localPhone)
    const res = await fetch('/api/auth/send-signup-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok || !data.success) { setError(data.error ?? 'Failed to send code'); return }
    setMaskedPhone(data.maskedPhone ?? phone)
    setStep('otp')
    setResendCountdown(60)
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length < 6) { setError('Enter the 6-digit code'); return }
    setLoading(true)
    setError(null)
    const phone = toE164(country.dial, localPhone)
    const res = await fetch('/api/auth/complete-onboarding', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, phone, code: otp }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok || !data.success) { setError(data.error ?? 'Verification failed'); return }
    router.push(redirectTo)
    router.refresh()
  }

  async function handleResend() {
    if (resendCountdown > 0) return
    setResendCountdown(60)
    setOtp('')
    setError(null)
    const phone = toE164(country.dial, localPhone)
    await fetch('/api/auth/send-signup-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
  }

  if (step === 'otp') {
    return (
      <div>
        <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '12px' }}>Verify your number</p>
        <p style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.55)', fontSize: '14px', lineHeight: 1.6, marginBottom: '36px' }}>
          Code sent to <span style={{ color: 'var(--cream)' }}>{maskedPhone}</span>
        </p>
        <form onSubmit={handleOtpSubmit}>
          <OtpInput value={otp} onChange={setOtp} disabled={loading} />
          {error && <div style={{ borderLeft: '2px solid rgba(180,83,9,0.8)', paddingLeft: '10px', marginBottom: '20px' }}><p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgb(217,119,6)', fontSize: '10px', letterSpacing: '0.08em' }}>{error}</p></div>}
          <button type="submit" disabled={loading} style={{ width: '100%', fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#0c0a09', background: 'var(--gold)', border: 'none', padding: '16px 20px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, borderRadius: '2px' }}>
            {loading ? 'Verifying...' : 'Verify and enter'}
          </button>
        </form>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button type="button" onClick={() => { setStep('form'); setOtp(''); setError(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,237,224,0.35)' }}>Back</button>
          <button type="button" onClick={handleResend} disabled={resendCountdown > 0} style={{ background: 'none', border: 'none', cursor: resendCountdown > 0 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: resendCountdown > 0 ? 'rgba(245,237,224,0.25)' : 'rgba(245,237,224,0.55)' }}>
            {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend code'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <FloatingInput
        label="Username"
        value={username}
        onChange={v => { setUsername(v.toLowerCase()); setUsernameStatus('idle') }}
        disabled={loading}
        hint={usernameHint?.text}
        hintColor={usernameHint?.color}
        onBlur={() => checkUsername(username)}
      />

      {/* Phone */}
      <div style={{ position: 'relative', paddingTop: '20px', marginBottom: '28px' }}>
        <label style={{ position: 'absolute', left: 0, top: '0px', fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', lineHeight: 1, pointerEvents: 'none' }}>Phone</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
          <button type="button" onClick={() => setCountryModalOpen(true)} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', borderBottom: '1px solid rgba(245,237,224,0.15)', padding: '8px 0', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '18px', lineHeight: 1 }}>{country.flag}</span>
            <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'rgba(245,237,224,0.7)', letterSpacing: '0.05em' }}>{country.dial}</span>
            <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M1 1L4 4L7 1" stroke="rgba(245,237,224,0.35)" strokeWidth="1.2" strokeLinecap="round" /></svg>
          </button>
          <input type="tel" inputMode="numeric" value={localPhone} onChange={e => setLocalPhone(e.target.value.replace(/[^\d\s\-()]/g, ''))} disabled={loading} placeholder="70 123 456"
            style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(245,237,224,0.15)', color: 'var(--cream)', fontFamily: 'var(--font-jost)', fontSize: '15px', padding: '8px 0', outline: 'none', minWidth: 0 }}
          />
        </div>
      </div>

      {error && <div style={{ borderLeft: '2px solid rgba(180,83,9,0.8)', paddingLeft: '10px', marginBottom: '20px' }}><p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgb(217,119,6)', fontSize: '10px', letterSpacing: '0.08em' }}>{error}</p></div>}
      <button type="submit" disabled={loading || usernameStatus === 'checking'} style={{ width: '100%', fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#0c0a09', background: 'var(--gold)', border: 'none', padding: '16px 20px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, borderRadius: '2px' }}>
        {loading ? 'Sending code...' : 'Continue'}
      </button>

      <CountryModal open={countryModalOpen} onClose={() => setCountryModalOpen(false)} onSelect={setCountry} current={country} />
    </form>
  )
}
