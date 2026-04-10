'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [secret, setSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret }),
    })
    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      setError('Wrong password.')
      setLoading(false)
    }
  }

  return (
    <main style={{ background: '#0c0a09', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '360px', padding: '0 24px' }}>
        <h1 style={{ color: '#CA8A04', fontFamily: 'sans-serif', fontSize: '20px', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '4px' }}>
          DEDSTOK
        </h1>
        <p style={{ color: 'rgba(245,237,224,0.35)', fontFamily: 'sans-serif', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '40px' }}>
          Admin
        </p>
        <input
          type="password"
          placeholder="Admin password"
          value={secret}
          onChange={e => setSecret(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
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
            marginBottom: '12px',
          }}
        />
        {error && <p style={{ color: '#ef4444', fontSize: '13px', fontFamily: 'sans-serif', marginBottom: '12px' }}>{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading || !secret}
          style={{
            width: '100%',
            background: loading || !secret ? 'rgba(202,138,4,0.4)' : '#CA8A04',
            color: '#0c0a09',
            border: 'none',
            borderRadius: '4px',
            padding: '13px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
            cursor: loading || !secret ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Entering...' : 'Enter'}
        </button>
      </div>
    </main>
  )
}
