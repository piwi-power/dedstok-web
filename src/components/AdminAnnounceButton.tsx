'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  winnerId: string
}

export default function AdminAnnounceButton({ winnerId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function announce() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/announce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winner_id: winnerId }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Failed')
    } else {
      setDone(true)
      router.refresh()
    }
    setLoading(false)
  }

  if (done) {
    return (
      <p style={{ color: '#22c55e', fontFamily: 'sans-serif', fontSize: '12px', fontWeight: 700 }}>
        Announced
      </p>
    )
  }

  return (
    <div>
      {error && <p style={{ color: '#ef4444', fontSize: '11px', fontFamily: 'sans-serif', marginBottom: '6px' }}>{error}</p>}
      <button
        onClick={announce}
        disabled={loading}
        style={{
          background: 'rgba(34,197,94,0.1)',
          color: '#22c55e',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: '4px',
          padding: '10px 20px',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
          cursor: loading ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {loading ? 'Announcing...' : 'Announce Winner'}
      </button>
      <p style={{ color: 'rgba(245,237,224,0.3)', fontSize: '10px', fontFamily: 'sans-serif', marginTop: '4px', textAlign: 'center' }}>
        Makes public on /winners
      </p>
    </div>
  )
}
