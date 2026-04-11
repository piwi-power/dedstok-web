'use client'

import { useState } from 'react'

interface Props {
  hashInput: string
  storedHash: string
}

export default function VerifyClient({ hashInput, storedHash }: Props) {
  const [result, setResult] = useState<'idle' | 'verified' | 'failed'>('idle')
  const [computed, setComputed] = useState('')
  const [loading, setLoading] = useState(false)

  async function runVerification() {
    setLoading(true)
    try {
      // SHA-256 runs entirely in the browser via Web Crypto API — no server involved
      const encoder = new TextEncoder()
      const data = encoder.encode(hashInput)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      setComputed(hashHex)
      setResult(hashHex === storedHash ? 'verified' : 'failed')
    } catch {
      setResult('failed')
    }
    setLoading(false)
  }

  return (
    <div>
      <button
        onClick={runVerification}
        disabled={loading || result !== 'idle'}
        style={{
          background: result === 'idle' ? '#CA8A04' : 'transparent',
          color: result === 'idle' ? '#0c0a09' : 'rgba(245,237,224,0.4)',
          border: result === 'idle' ? 'none' : '1px solid rgba(245,237,224,0.15)',
          borderRadius: '4px',
          padding: '12px 24px',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
          cursor: loading || result !== 'idle' ? 'not-allowed' : 'pointer',
          marginBottom: '20px',
        }}
      >
        {loading ? 'Computing...' : result !== 'idle' ? 'Verified' : 'Verify in Browser'}
      </button>

      {result === 'verified' && (
        <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '4px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ color: '#22c55e', fontSize: '18px' }}>&#10003;</span>
            <p style={{ color: '#22c55e', fontFamily: 'sans-serif', fontSize: '14px', fontWeight: 700 }}>
              Draw Verified
            </p>
          </div>
          <p style={{ color: 'rgba(245,237,224,0.5)', fontSize: '12px', lineHeight: 1.6, marginBottom: '12px' }}>
            Your browser computed the SHA-256 hash of the draw inputs and it matches exactly. The winner was chosen by math, not by DEDSTOK.
          </p>
          <p style={{ color: 'rgba(245,237,224,0.3)', fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all' }}>
            {computed}
          </p>
        </div>
      )}

      {result === 'failed' && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', padding: '20px' }}>
          <p style={{ color: '#ef4444', fontFamily: 'sans-serif', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>
            Hash Mismatch
          </p>
          <p style={{ color: 'rgba(245,237,224,0.5)', fontSize: '12px' }}>
            The computed hash does not match the stored hash. Contact DEDSTOK immediately.
          </p>
        </div>
      )}
    </div>
  )
}
