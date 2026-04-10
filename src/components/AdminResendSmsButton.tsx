'use client'

import { useState } from 'react'

interface Props {
  winnerId: string
}

export default function AdminResendSmsButton({ winnerId }: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function resend() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/resend-winner-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winner_id: winnerId }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Failed')
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  if (done) {
    return <p style={{ color: '#22c55e', fontFamily: 'sans-serif', fontSize: '11px' }}>SMS sent</p>
  }

  return (
    <div>
      {error && <p style={{ color: '#ef4444', fontSize: '11px', fontFamily: 'sans-serif', marginBottom: '4px' }}>{error}</p>}
      <button
        onClick={resend}
        disabled={loading}
        style={{
          background: 'transparent',
          color: 'rgba(245,237,224,0.4)',
          border: '1px solid rgba(245,237,224,0.15)',
          borderRadius: '4px',
          padding: '6px 14px',
          fontSize: '11px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
          cursor: loading ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {loading ? 'Sending...' : 'Resend SMS'}
      </button>
    </div>
  )
}
