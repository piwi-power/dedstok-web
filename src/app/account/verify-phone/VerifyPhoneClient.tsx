'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  returnTo: string
}

export default function VerifyPhoneClient({ returnTo }: Props) {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendOtp() {
    setError('')
    setLoading(true)
    const res = await fetch('/api/phone/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const data = await res.json()
    setLoading(false)
    if (!data.success) { setError(data.error); return }
    setStep('code')
  }

  async function verifyOtp() {
    setError('')
    setLoading(true)
    const res = await fetch('/api/phone/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    })
    const data = await res.json()
    setLoading(false)
    if (!data.success) { setError(data.error); return }
    router.push(returnTo)
  }

  const inputBase: React.CSSProperties = {
    width: '100%',
    background: 'rgba(245,237,224,0.04)',
    border: '1px solid rgba(245,237,224,0.12)',
    color: 'var(--cream)',
    outline: 'none',
    boxSizing: 'border-box',
    borderRadius: 0,
    padding: '14px 16px',
    transition: 'border-color 150ms ease',
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>

        <p style={{ fontFamily: 'var(--font-anton)', fontSize: '14px', letterSpacing: '0.12em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '48px' }}>
          DEDSTOK
        </p>

        <div style={{ width: '32px', height: '1px', background: 'rgba(202,138,4,0.4)', marginBottom: '24px' }} />

        {step === 'phone' ? (
          <>
            <h1 style={{ fontFamily: 'var(--font-jost)', fontWeight: 300, color: 'var(--cream)', fontSize: '28px', lineHeight: 1.2, marginBottom: '8px', letterSpacing: '-0.01em' }}>
              Verify your number
            </h1>
            <p style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.42)', fontSize: '13px', lineHeight: 1.6, marginBottom: '40px' }}>
              Required to enter drops and receive your winner notification by SMS. One number per account.
            </p>

            <label style={{ display: 'block', fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.35)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '10px' }}>
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+96170123456"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(202,138,4,0.5)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(245,237,224,0.12)' }}
              style={{ ...inputBase, fontFamily: 'var(--font-dm-mono)', fontSize: '15px', letterSpacing: '0.05em', marginBottom: '8px' }}
            />
            <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.2)', fontSize: '10px', marginBottom: '32px', letterSpacing: '0.05em' }}>
              Include country code — +961 for Lebanon
            </p>

            {error && (
              <p style={{ fontFamily: 'var(--font-jost)', color: 'var(--signal)', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>{error}</p>
            )}

            <button
              onClick={sendOtp}
              disabled={loading || !phone}
              style={{
                width: '100%',
                background: loading || !phone ? 'rgba(202,138,4,0.35)' : 'var(--gold)',
                color: '#0c0a09',
                border: 'none',
                padding: '16px',
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '9px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: loading || !phone ? 'not-allowed' : 'pointer',
                transition: 'opacity 150ms',
              }}
              onMouseEnter={e => { if (!loading && phone) e.currentTarget.style.opacity = '0.88' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              {loading ? 'Sending...' : 'Send Code'}
            </button>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: 'var(--font-jost)', fontWeight: 300, color: 'var(--cream)', fontSize: '28px', lineHeight: 1.2, marginBottom: '8px', letterSpacing: '-0.01em' }}>
              Enter your code
            </h1>
            <p style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.42)', fontSize: '13px', lineHeight: 1.6, marginBottom: '40px' }}>
              Sent to <span style={{ color: 'var(--cream)' }}>{phone}</span>. Valid for 10 minutes.
            </p>

            <label style={{ display: 'block', fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.35)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '10px' }}>
              6-Digit Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(202,138,4,0.5)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(245,237,224,0.12)' }}
              style={{ ...inputBase, fontFamily: 'var(--font-dm-mono)', fontSize: '28px', letterSpacing: '0.4em', textAlign: 'center', marginBottom: '32px' }}
            />

            {error && (
              <p style={{ fontFamily: 'var(--font-jost)', color: 'var(--signal)', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>{error}</p>
            )}

            <button
              onClick={verifyOtp}
              disabled={loading || code.length < 6}
              style={{
                width: '100%',
                background: loading || code.length < 6 ? 'rgba(202,138,4,0.35)' : 'var(--gold)',
                color: '#0c0a09',
                border: 'none',
                padding: '16px',
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '9px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: loading || code.length < 6 ? 'not-allowed' : 'pointer',
                marginBottom: '16px',
                transition: 'opacity 150ms',
              }}
              onMouseEnter={e => { if (!loading && code.length >= 6) e.currentTarget.style.opacity = '0.88' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              {loading ? 'Verifying...' : 'Confirm'}
            </button>

            <button
              onClick={() => { setStep('phone'); setCode(''); setError('') }}
              style={{
                width: '100%',
                background: 'transparent',
                color: 'rgba(245,237,224,0.28)',
                border: 'none',
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '9px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                padding: '12px',
                transition: 'color 150ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(245,237,224,0.6)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(245,237,224,0.28)' }}
            >
              Wrong number? Go back
            </button>
          </>
        )}
      </div>
    </main>
  )
}
