'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VerifyPhonePage() {
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
    if (!data.success) {
      setError(data.error)
      return
    }
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
    if (!data.success) {
      setError(data.error)
      return
    }
    router.push('/account?verified=1')
  }

  return (
    <main style={{ background: '#0c0a09', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ color: '#CA8A04', fontSize: '24px', fontFamily: 'sans-serif', marginBottom: '8px' }}>
          DEDSTOK
        </h1>
        <p style={{ color: 'rgba(245,237,224,0.55)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '40px', fontFamily: 'sans-serif' }}>
          Verify Your Phone
        </p>

        {step === 'phone' ? (
          <>
            <p style={{ color: 'rgba(245,237,224,0.6)', fontSize: '13px', fontFamily: 'sans-serif', marginBottom: '24px', lineHeight: '1.6' }}>
              One phone number per account. Required to enter any drop and to receive winner notification by SMS.
            </p>
            <label style={{ display: 'block', color: 'rgba(245,237,224,0.4)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '8px' }}>
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+96170123456"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(245,237,224,0.05)',
                border: '1px solid rgba(245,237,224,0.15)',
                borderRadius: '4px',
                padding: '12px 16px',
                color: '#f5ede0',
                fontSize: '16px',
                fontFamily: 'sans-serif',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '8px',
              }}
            />
            <p style={{ color: 'rgba(245,237,224,0.3)', fontSize: '11px', fontFamily: 'sans-serif', marginBottom: '24px' }}>
              Include country code. Example: +961 for Lebanon.
            </p>
            {error && (
              <p style={{ color: '#ef4444', fontSize: '13px', fontFamily: 'sans-serif', marginBottom: '16px' }}>{error}</p>
            )}
            <button
              onClick={sendOtp}
              disabled={loading || !phone}
              style={{
                width: '100%',
                background: loading || !phone ? 'rgba(202,138,4,0.4)' : '#CA8A04',
                color: '#0c0a09',
                border: 'none',
                borderRadius: '4px',
                padding: '14px',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'sans-serif',
                cursor: loading || !phone ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Sending...' : 'Send Code'}
            </button>
          </>
        ) : (
          <>
            <p style={{ color: 'rgba(245,237,224,0.6)', fontSize: '13px', fontFamily: 'sans-serif', marginBottom: '24px' }}>
              Code sent to <strong style={{ color: '#f5ede0' }}>{phone}</strong>. Valid for 10 minutes.
            </p>
            <label style={{ display: 'block', color: 'rgba(245,237,224,0.4)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '8px' }}>
              Verification Code
            </label>
            <input
              type="text"
              placeholder="123456"
              value={code}
              onChange={e => setCode(e.target.value)}
              maxLength={6}
              style={{
                width: '100%',
                background: 'rgba(245,237,224,0.05)',
                border: '1px solid rgba(245,237,224,0.15)',
                borderRadius: '4px',
                padding: '12px 16px',
                color: '#f5ede0',
                fontSize: '24px',
                letterSpacing: '0.3em',
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '24px',
              }}
            />
            {error && (
              <p style={{ color: '#ef4444', fontSize: '13px', fontFamily: 'sans-serif', marginBottom: '16px' }}>{error}</p>
            )}
            <button
              onClick={verifyOtp}
              disabled={loading || code.length < 6}
              style={{
                width: '100%',
                background: loading || code.length < 6 ? 'rgba(202,138,4,0.4)' : '#CA8A04',
                color: '#0c0a09',
                border: 'none',
                borderRadius: '4px',
                padding: '14px',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'sans-serif',
                cursor: loading || code.length < 6 ? 'not-allowed' : 'pointer',
                marginBottom: '16px',
              }}
            >
              {loading ? 'Verifying...' : 'Confirm'}
            </button>
            <button
              onClick={() => { setStep('phone'); setCode(''); setError('') }}
              style={{
                width: '100%',
                background: 'transparent',
                color: 'rgba(245,237,224,0.4)',
                border: 'none',
                fontSize: '12px',
                fontFamily: 'sans-serif',
                cursor: 'pointer',
                padding: '8px',
              }}
            >
              Wrong number? Go back
            </button>
          </>
        )}
      </div>
    </main>
  )
}
