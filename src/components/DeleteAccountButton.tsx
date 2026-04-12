'use client'

import { useState } from 'react'

export default function DeleteAccountButton() {
  const [step, setStep] = useState<'idle' | 'confirm' | 'loading'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setStep('loading')
    setError(null)

    const res = await fetch('/api/account/delete', { method: 'DELETE' })
    const data = await res.json()

    if (!res.ok || !data.success) {
      setError(data.error ?? 'Something went wrong. Try again.')
      setStep('confirm')
      return
    }

    window.location.href = '/'
  }

  if (step === 'idle') {
    return (
      <button
        onClick={() => setStep('confirm')}
        style={{ fontFamily: 'sans-serif', fontSize: '11px', color: 'rgba(245,237,224,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        Delete Account
      </button>
    )
  }

  return (
    <div style={{ border: '1px solid rgba(239,68,68,0.25)', borderRadius: '4px', padding: '20px', background: 'rgba(239,68,68,0.04)' }}>
      <p style={{ color: '#f5ede0', fontFamily: 'sans-serif', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
        Delete your account?
      </p>
      <p style={{ color: 'rgba(245,237,224,0.45)', fontFamily: 'sans-serif', fontSize: '12px', lineHeight: 1.6, marginBottom: '16px' }}>
        This is permanent. Your entries, points, and history will be erased. Any spots purchased in active raffles will be removed — no refund is issued for deleted accounts.
      </p>
      {error && (
        <p style={{ color: '#f87171', fontSize: '12px', fontFamily: 'sans-serif', marginBottom: '12px' }}>{error}</p>
      )}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleDelete}
          disabled={step === 'loading'}
          style={{ fontFamily: 'sans-serif', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', padding: '8px 16px', borderRadius: '4px', cursor: step === 'loading' ? 'not-allowed' : 'pointer', opacity: step === 'loading' ? 0.5 : 1 }}
        >
          {step === 'loading' ? 'Deleting...' : 'Yes, delete everything'}
        </button>
        <button
          onClick={() => { setStep('idle'); setError(null) }}
          disabled={step === 'loading'}
          style={{ fontFamily: 'sans-serif', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', border: '1px solid rgba(245,237,224,0.15)', color: 'rgba(245,237,224,0.4)', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
