'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  dropId: string
  entryCount: number
}

export default function AdminDrawButton({ dropId, entryCount }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ winner_email: string; winning_ticket: number; total_tickets: number; verification_hash: string } | null>(null)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  async function runDraw() {
    if (!confirmed) {
      setConfirmed(true)
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drop_id: dropId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Draw failed')
        setConfirmed(false)
      } else {
        setResult(data)
        router.refresh()
      }
    } catch {
      setError('Network error')
    }
    setLoading(false)
  }

  if (result) {
    return (
      <div style={{ textAlign: 'right' }}>
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '4px', padding: '16px', maxWidth: '260px' }}>
          <p style={{ color: '#22c55e', fontFamily: 'sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Winner Drawn
          </p>
          <p style={{ color: '#f5ede0', fontFamily: 'monospace', fontSize: '12px', marginBottom: '4px' }}>{result.winner_email}</p>
          <p style={{ color: 'rgba(245,237,224,0.5)', fontFamily: 'sans-serif', fontSize: '11px', marginBottom: '4px' }}>
            Ticket #{result.winning_ticket} of {result.total_tickets}
          </p>
          <p style={{ color: 'rgba(245,237,224,0.3)', fontFamily: 'monospace', fontSize: '9px', wordBreak: 'break-all' }}>
            {result.verification_hash.slice(0, 32)}...
          </p>
          <p style={{ color: 'rgba(245,237,224,0.4)', fontFamily: 'sans-serif', fontSize: '11px', marginTop: '8px' }}>
            Email + SMS sent. Announce below when ready.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'right' }}>
      {confirmed && !loading && (
        <p style={{ color: 'rgba(245,237,224,0.5)', fontSize: '12px', fontFamily: 'sans-serif', marginBottom: '8px' }}>
          This cannot be undone. Click again to confirm.
        </p>
      )}
      {error && (
        <p style={{ color: '#ef4444', fontSize: '12px', fontFamily: 'sans-serif', marginBottom: '8px' }}>{error}</p>
      )}
      <button
        onClick={runDraw}
        disabled={loading || entryCount === 0}
        style={{
          background: confirmed ? '#CA8A04' : 'rgba(202,138,4,0.15)',
          color: confirmed ? '#0c0a09' : '#CA8A04',
          border: `1px solid ${confirmed ? '#CA8A04' : 'rgba(202,138,4,0.4)'}`,
          borderRadius: '4px',
          padding: '10px 20px',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
          cursor: loading || entryCount === 0 ? 'not-allowed' : 'pointer',
          opacity: entryCount === 0 ? 0.4 : 1,
          minWidth: '140px',
        }}
      >
        {loading ? 'Drawing...' : confirmed ? 'Confirm Draw' : 'Run Draw'}
      </button>
      {entryCount === 0 && (
        <p style={{ color: 'rgba(245,237,224,0.3)', fontSize: '11px', fontFamily: 'sans-serif', marginTop: '6px' }}>
          No entries yet
        </p>
      )}
      {confirmed && !loading && (
        <button
          onClick={() => setConfirmed(false)}
          style={{ display: 'block', marginTop: '6px', background: 'none', border: 'none', color: 'rgba(245,237,224,0.3)', fontSize: '11px', fontFamily: 'sans-serif', cursor: 'pointer', width: '100%', textAlign: 'right' }}
        >
          Cancel
        </button>
      )}
    </div>
  )
}
