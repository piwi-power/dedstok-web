'use client'

import { useState, useRef } from 'react'
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

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.3em',
      textTransform: 'uppercase', color: 'rgba(245,237,224,0.3)', marginBottom: '20px',
    }}>
      {children}
    </p>
  )
}

function InfoRow({ label, value, dim }: { label: string; value: string; dim?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(245,237,224,0.06)' }}>
      <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,237,224,0.35)' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-jost)', fontSize: '14px', color: dim ? 'rgba(245,237,224,0.4)' : 'var(--cream)' }}>
        {value}
      </span>
    </div>
  )
}

function StatusBadge({ verified }: { verified: boolean }) {
  return (
    <span style={{
      fontFamily: 'var(--font-dm-mono)', fontSize: '8px', letterSpacing: '0.12em',
      padding: '2px 7px', borderRadius: '2px',
      background: verified ? 'rgba(34,197,94,0.12)' : 'rgba(245,237,224,0.06)',
      color: verified ? '#22c55e' : 'rgba(245,237,224,0.3)',
    }}>
      {verified ? 'Verified' : 'Unverified'}
    </span>
  )
}

function FieldInput({ label, value, onChange, type = 'text', disabled, placeholder }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; disabled?: boolean; placeholder?: string
}) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0
  return (
    <div style={{ position: 'relative', paddingTop: '20px', marginBottom: '24px' }}>
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
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        placeholder={placeholder}
        style={{
          width: '100%', background: 'transparent', border: 'none',
          borderBottom: `1px solid ${focused ? 'rgba(202,138,4,0.8)' : 'rgba(245,237,224,0.15)'}`,
          color: 'var(--cream)', fontFamily: 'var(--font-jost)', fontSize: '15px',
          padding: '8px 0', outline: 'none', boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

function StrengthBar({ password }: { password: string }) {
  const { score, label, color } = passwordStrength(password)
  if (!password) return null
  const filled = Math.min(Math.ceil((score / 5) * 4), 4)
  return (
    <div style={{ marginTop: '-8px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: '2px', borderRadius: '1px', background: i < filled ? color : 'rgba(245,237,224,0.1)', transition: 'background 300ms ease' }} />
        ))}
      </div>
      <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.12em', color }}>{label}</p>
    </div>
  )
}

function GoldBtn({ children, loading, onClick, type = 'button' }: { children: React.ReactNode; loading?: boolean; onClick?: () => void; type?: 'button' | 'submit' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      style={{
        fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '0.22em',
        textTransform: 'uppercase', color: '#0c0a09', background: 'var(--gold)',
        border: 'none', padding: '12px 24px', cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1, borderRadius: '2px', transition: 'opacity 200ms ease',
      }}
    >
      {children}
    </button>
  )
}

function ErrorMsg({ msg }: { msg: string | null }) {
  if (!msg) return null
  return (
    <div style={{ borderLeft: '2px solid rgba(180,83,9,0.8)', paddingLeft: '10px', marginBottom: '16px' }}>
      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgb(217,119,6)', fontSize: '10px', letterSpacing: '0.08em' }}>{msg}</p>
    </div>
  )
}

function SuccessMsg({ msg }: { msg: string | null }) {
  if (!msg) return null
  return (
    <div style={{ borderLeft: '2px solid rgba(34,197,94,0.6)', paddingLeft: '10px', marginBottom: '16px' }}>
      <p style={{ fontFamily: 'var(--font-dm-mono)', color: '#22c55e', fontSize: '10px', letterSpacing: '0.08em' }}>{msg}</p>
    </div>
  )
}

// ── OTP input ─────────────────────────────────────────────────────────────────

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
    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input key={i} ref={el => { refs.current[i] = el }} type="text" inputMode="numeric" maxLength={1}
          value={digits[i] ?? ''} onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)} onPaste={handlePaste} disabled={disabled}
          style={{
            width: '40px', height: '48px', textAlign: 'center', background: 'rgba(245,237,224,0.04)',
            border: `1px solid ${digits[i] ? 'rgba(202,138,4,0.5)' : 'rgba(245,237,224,0.12)'}`,
            borderRadius: '2px', color: 'var(--cream)', fontFamily: 'var(--font-dm-mono)',
            fontSize: '18px', outline: 'none', flexShrink: 0,
          }}
        />
      ))}
    </div>
  )
}

// ── Country modal (compact) ───────────────────────────────────────────────────

function CountryModal({ open, onClose, onSelect, current }: {
  open: boolean; onClose: () => void; onSelect: (c: Country) => void; current: Country
}) {
  const [search, setSearch] = useState('')
  const filtered = search ? COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search)) : COUNTRIES
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10,8,4,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0c0a09', border: '1px solid rgba(245,237,224,0.1)', borderRadius: '4px 4px 0 0', width: '100%', maxWidth: '480px', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(245,237,224,0.08)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(245,237,224,0.35)' }}>Country Code</p>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,237,224,0.35)', display: 'flex', alignItems: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            style={{ width: '100%', background: 'rgba(245,237,224,0.05)', border: '1px solid rgba(245,237,224,0.1)', color: 'var(--cream)', fontFamily: 'var(--font-jost)', fontSize: '14px', padding: '10px 14px', outline: 'none', borderRadius: '2px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filtered.map(c => (
            <button key={c.code} onClick={() => { onSelect(c); onClose() }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', background: c.code === current.code ? 'rgba(202,138,4,0.08)' : 'none', border: 'none', borderBottom: '1px solid rgba(245,237,224,0.04)', cursor: 'pointer' }}>
              <span style={{ fontSize: '20px' }}>{c.flag}</span>
              <span style={{ fontFamily: 'var(--font-jost)', fontSize: '14px', color: 'var(--cream)', flex: 1, textAlign: 'left' }}>{c.name}</span>
              <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: c.code === current.code ? 'var(--gold)' : 'rgba(245,237,224,0.4)' }}>{c.dial}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '40px', paddingBottom: '40px', borderBottom: '1px solid rgba(245,237,224,0.06)' }}>
      {children}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AccountClient({
  email, username, phone, phoneVerified, authProvider, referralCode,
}: {
  email: string
  username: string | null
  phone: string | null
  phoneVerified: boolean
  authProvider: string
  referralCode: string | null
}) {
  // Phone change state
  const [phoneStep, setPhoneStep] = useState<'idle' | 'enter' | 'otp'>('idle')
  const [country, setCountry] = useState<Country>(() => getCountry(detectCountryCode()))
  const [localPhone, setLocalPhone] = useState('')
  const [countryModalOpen, setCountryModalOpen] = useState(false)
  const [phoneOtp, setPhoneOtp] = useState('')
  const [newPhoneE164, setNewPhoneE164] = useState('')
  const [maskedNewPhone, setMaskedNewPhone] = useState('')
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [phoneSuccess, setPhoneSuccess] = useState<string | null>(null)

  // Password change state
  const [pwOpen, setPwOpen] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState<string | null>(null)

  // Copy referral link
  const [copied, setCopied] = useState(false)
  const referralLink = referralCode ? `${typeof window !== 'undefined' ? window.location.origin : 'https://dedstok.com'}/login?ref=${referralCode}&tab=signup` : null

  async function handleSendPhoneOtp() {
    setPhoneError(null)
    if (!localPhone) { setPhoneError('Enter your new number'); return }
    const phone = toE164(country.dial, localPhone)
    setNewPhoneE164(phone)
    setPhoneLoading(true)
    const res = await fetch('/api/account/change-phone', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const data = await res.json()
    setPhoneLoading(false)
    if (!res.ok || !data.success) { setPhoneError(data.error ?? 'Failed to send code'); return }
    setMaskedNewPhone(data.maskedPhone)
    setPhoneStep('otp')
  }

  async function handleVerifyPhoneOtp() {
    if (phoneOtp.length < 6) { setPhoneError('Enter the 6-digit code'); return }
    setPhoneLoading(true)
    setPhoneError(null)
    const res = await fetch('/api/account/verify-phone-change', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: newPhoneE164, code: phoneOtp }),
    })
    const data = await res.json()
    setPhoneLoading(false)
    if (!res.ok || !data.success) { setPhoneError(data.error ?? 'Verification failed'); return }
    setPhoneSuccess('Phone number updated.')
    setPhoneStep('idle')
    setLocalPhone('')
    setPhoneOtp('')
  }

  async function handleChangePassword() {
    setPwError(null)
    if (!currentPw) { setPwError('Enter your current password'); return }
    if (newPw.length < 6 || newPw.length > 20) { setPwError('New password must be 6–20 characters'); return }
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return }
    setPwLoading(true)
    const res = await fetch('/api/account/change-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    })
    const data = await res.json()
    setPwLoading(false)
    if (!res.ok || !data.success) { setPwError(data.error ?? 'Failed to update password'); return }
    setPwSuccess('Password updated.')
    setPwOpen(false)
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
  }

  function handleCopyLink() {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div>
      {/* ── Account info ── */}
      <Section>
        <SectionLabel>Account</SectionLabel>
        {username && <InfoRow label="Username" value={`@${username}`} />}
        <InfoRow label="Email" value={email} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(245,237,224,0.06)' }}>
          <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,237,224,0.35)' }}>Phone</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontFamily: 'var(--font-jost)', fontSize: '14px', color: phone ? 'var(--cream)' : 'rgba(245,237,224,0.3)' }}>
              {phone ?? 'Not set'}
            </span>
            {phone && <StatusBadge verified={phoneVerified} />}
          </div>
        </div>
        <InfoRow label="Sign-in method" value={authProvider === 'google' ? 'Google' : 'Email & Password'} dim />
      </Section>

      {/* ── Change phone ── */}
      <Section>
        <SectionLabel>Phone Number</SectionLabel>
        {phoneSuccess && <SuccessMsg msg={phoneSuccess} />}

        {phoneStep === 'idle' && (
          <button
            type="button"
            onClick={() => { setPhoneStep('enter'); setPhoneError(null); setPhoneSuccess(null) }}
            style={{
              background: 'none', border: '1px solid rgba(245,237,224,0.12)', borderRadius: '2px',
              padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-dm-mono)',
              fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'rgba(245,237,224,0.5)',
            }}
          >
            {phone ? 'Change phone number' : 'Add phone number'}
          </button>
        )}

        {phoneStep === 'enter' && (
          <div>
            <p style={{ fontFamily: 'var(--font-jost)', fontSize: '13px', color: 'rgba(245,237,224,0.45)', marginBottom: '24px', lineHeight: 1.5 }}>
              Enter your new number. A verification code will be sent via SMS.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <button type="button" onClick={() => setCountryModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', borderBottom: '1px solid rgba(245,237,224,0.15)', padding: '8px 0', cursor: 'pointer', flexShrink: 0 }}>
                <span style={{ fontSize: '18px' }}>{country.flag}</span>
                <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'rgba(245,237,224,0.7)' }}>{country.dial}</span>
                <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M1 1L4 4L7 1" stroke="rgba(245,237,224,0.35)" strokeWidth="1.2" strokeLinecap="round" /></svg>
              </button>
              <input type="tel" inputMode="numeric" value={localPhone} onChange={e => setLocalPhone(e.target.value.replace(/[^\d\s\-()]/g, ''))} placeholder="70 123 456"
                style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(245,237,224,0.15)', color: 'var(--cream)', fontFamily: 'var(--font-jost)', fontSize: '15px', padding: '8px 0', outline: 'none', minWidth: 0 }}
              />
            </div>
            <ErrorMsg msg={phoneError} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <GoldBtn loading={phoneLoading} onClick={handleSendPhoneOtp}>Send Code</GoldBtn>
              <button type="button" onClick={() => { setPhoneStep('idle'); setPhoneError(null) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,237,224,0.3)' }}>
                Cancel
              </button>
            </div>
            <CountryModal open={countryModalOpen} onClose={() => setCountryModalOpen(false)} onSelect={setCountry} current={country} />
          </div>
        )}

        {phoneStep === 'otp' && (
          <div>
            <p style={{ fontFamily: 'var(--font-jost)', fontSize: '13px', color: 'rgba(245,237,224,0.45)', marginBottom: '24px', lineHeight: 1.5 }}>
              Code sent to <span style={{ color: 'var(--cream)' }}>{maskedNewPhone}</span>
            </p>
            <OtpInput value={phoneOtp} onChange={setPhoneOtp} disabled={phoneLoading} />
            <ErrorMsg msg={phoneError} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <GoldBtn loading={phoneLoading} onClick={handleVerifyPhoneOtp}>Verify</GoldBtn>
              <button type="button" onClick={() => { setPhoneStep('enter'); setPhoneError(null) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,237,224,0.3)' }}>
                Back
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* ── Password (email accounts only) ── */}
      {authProvider !== 'google' && (
        <Section>
          <SectionLabel>Password</SectionLabel>
          {pwSuccess && <SuccessMsg msg={pwSuccess} />}
          {!pwOpen ? (
            <button
              type="button"
              onClick={() => { setPwOpen(true); setPwError(null); setPwSuccess(null) }}
              style={{
                background: 'none', border: '1px solid rgba(245,237,224,0.12)', borderRadius: '2px',
                padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-dm-mono)',
                fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'rgba(245,237,224,0.5)',
              }}
            >
              Change password
            </button>
          ) : (
            <div>
              <div style={{ position: 'relative', paddingTop: '20px', marginBottom: '24px' }}>
                <label style={{ position: 'absolute', left: 0, top: '0', fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', lineHeight: 1 }}>Current Password</label>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                  <input type={showCurrent ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                    style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(245,237,224,0.15)', color: 'var(--cream)', fontFamily: 'var(--font-jost)', fontSize: '15px', padding: '8px 0', outline: 'none' }}
                  />
                  <button type="button" onClick={() => setShowCurrent(v => !v)} tabIndex={-1}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,237,224,0.35)', padding: '0 0 0 8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  </button>
                </div>
              </div>

              <div style={{ position: 'relative', paddingTop: '20px', marginBottom: '24px' }}>
                <label style={{ position: 'absolute', left: 0, top: '0', fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', lineHeight: 1 }}>New Password</label>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                  <input type={showNew ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)}
                    style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(245,237,224,0.15)', color: 'var(--cream)', fontFamily: 'var(--font-jost)', fontSize: '15px', padding: '8px 0', outline: 'none' }}
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)} tabIndex={-1}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,237,224,0.35)', padding: '0 0 0 8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  </button>
                </div>
              </div>
              <StrengthBar password={newPw} />

              <FieldInput label="Confirm New Password" value={confirmPw} onChange={setConfirmPw} type="password" />

              <ErrorMsg msg={pwError} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <GoldBtn loading={pwLoading} onClick={handleChangePassword}>Update Password</GoldBtn>
                <button type="button" onClick={() => { setPwOpen(false); setPwError(null); setCurrentPw(''); setNewPw(''); setConfirmPw('') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,237,224,0.3)' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Section>
      )}

      {/* ── Referral link ── */}
      {referralCode && (
        <Section>
          <SectionLabel>Your Referral Link</SectionLabel>
          <p style={{ fontFamily: 'var(--font-jost)', fontSize: '13px', color: 'rgba(245,237,224,0.4)', marginBottom: '16px', lineHeight: 1.5 }}>
            Share this link. Anyone who signs up through it is permanently linked to you.
          </p>
          <div style={{
            background: 'rgba(245,237,224,0.03)', border: '1px solid rgba(245,237,224,0.08)',
            borderRadius: '2px', padding: '14px 16px', marginBottom: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          }}>
            <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: 'rgba(245,237,224,0.5)', wordBreak: 'break-all', flex: 1 }}>
              {referralLink}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              style={{
                background: 'none', border: '1px solid rgba(245,237,224,0.15)', borderRadius: '2px',
                padding: '6px 14px', cursor: 'pointer', flexShrink: 0,
                fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em',
                textTransform: 'uppercase', color: copied ? '#22c55e' : 'rgba(245,237,224,0.5)',
                transition: 'color 200ms ease, border-color 200ms ease',
              }}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.1em', color: 'rgba(245,237,224,0.25)' }}>
            Code: {referralCode.toUpperCase()}
          </p>
        </Section>
      )}
    </div>
  )
}
