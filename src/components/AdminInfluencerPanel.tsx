'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface InfluencerCode {
  id: string
  code: string
  influencer_name: string
  instagram_handle: string | null
  commission_per_ticket: number
  total_tickets_credited: number
  total_commission_earned: number
  is_active: boolean
}

interface Props {
  codes: InfluencerCode[]
}

export default function AdminInfluencerPanel({ codes: initialCodes }: Props) {
  const router = useRouter()
  const [codes, setCodes] = useState(initialCodes)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', instagram: '', commission: '1' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function createCode() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/influencer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...form }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Failed')
    } else {
      setCreating(false)
      setForm({ name: '', instagram: '', commission: '1' })
      router.refresh()
    }
    setLoading(false)
  }

  async function toggleCode(id: string, current: boolean) {
    await fetch('/api/admin/influencer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', id, is_active: !current }),
    })
    setCodes(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c))
  }

  const input: React.CSSProperties = {
    background: 'rgba(245,237,224,0.05)',
    border: '1px solid rgba(245,237,224,0.15)',
    borderRadius: '4px',
    padding: '8px 12px',
    color: '#f5ede0',
    fontSize: '13px',
    fontFamily: 'sans-serif',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  }

  return (
    <section style={{ marginBottom: '48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
          Influencer Codes
        </p>
        <button
          onClick={() => setCreating(!creating)}
          style={{
            background: creating ? 'transparent' : 'rgba(202,138,4,0.15)',
            color: '#CA8A04',
            border: '1px solid rgba(202,138,4,0.3)',
            borderRadius: '4px',
            padding: '6px 14px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
            cursor: 'pointer',
          }}
        >
          {creating ? 'Cancel' : '+ New Code'}
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div style={{ border: '1px solid rgba(202,138,4,0.2)', borderRadius: '4px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '12px', marginBottom: '12px' }}>
            <div>
              <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '4px' }}>Name</p>
              <input style={input} placeholder="Influencer name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '4px' }}>Instagram</p>
              <input style={input} placeholder="@handle" value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} />
            </div>
            <div>
              <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '4px' }}>Commission $</p>
              <input style={input} type="number" min="0" step="0.5" value={form.commission} onChange={e => setForm(f => ({ ...f, commission: e.target.value }))} />
            </div>
          </div>
          {form.name && (
            <p style={{ color: 'rgba(245,237,224,0.3)', fontSize: '11px', fontFamily: 'monospace', marginBottom: '12px' }}>
              Code: {form.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)}
            </p>
          )}
          {error && <p style={{ color: '#ef4444', fontSize: '12px', fontFamily: 'sans-serif', marginBottom: '8px' }}>{error}</p>}
          <button
            onClick={createCode}
            disabled={loading || !form.name}
            style={{
              background: loading || !form.name ? 'rgba(202,138,4,0.3)' : '#CA8A04',
              color: '#0c0a09',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 20px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontFamily: 'sans-serif',
              cursor: loading || !form.name ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Creating...' : 'Create Code'}
          </button>
        </div>
      )}

      {/* Codes table */}
      {codes.length === 0 ? (
        <div style={{ border: '1px solid rgba(245,237,224,0.08)', borderRadius: '4px', padding: '32px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(245,237,224,0.3)', fontSize: '13px', fontFamily: 'sans-serif' }}>No codes yet.</p>
        </div>
      ) : (
        <div style={{ border: '1px solid rgba(245,237,224,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          {codes.map((c, i) => (
            <div
              key={c.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 80px 100px 100px 80px',
                gap: '0',
                padding: '14px 20px',
                borderBottom: i < codes.length - 1 ? '1px solid rgba(245,237,224,0.06)' : 'none',
                alignItems: 'center',
              }}
            >
              <p style={{ color: '#CA8A04', fontFamily: 'monospace', fontSize: '13px', fontWeight: 700 }}>{c.code}</p>
              <div>
                <p style={{ color: '#f5ede0', fontSize: '13px', fontFamily: 'sans-serif' }}>{c.influencer_name}</p>
                {c.instagram_handle && (
                  <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '11px', fontFamily: 'sans-serif' }}>{c.instagram_handle}</p>
                )}
              </div>
              <p style={{ color: 'rgba(245,237,224,0.5)', fontSize: '12px', fontFamily: 'sans-serif', textAlign: 'right' }}>
                {c.total_tickets_credited} tickets
              </p>
              <p style={{ color: 'rgba(245,237,224,0.5)', fontSize: '12px', fontFamily: 'sans-serif', textAlign: 'right' }}>
                ${c.total_commission_earned.toFixed(2)}
              </p>
              <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '11px', fontFamily: 'sans-serif', textAlign: 'right' }}>
                ${c.commission_per_ticket}/ticket
              </p>
              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={() => toggleCode(c.id, c.is_active)}
                  style={{
                    background: c.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(245,237,224,0.06)',
                    color: c.is_active ? '#22c55e' : 'rgba(245,237,224,0.35)',
                    border: `1px solid ${c.is_active ? 'rgba(34,197,94,0.3)' : 'rgba(245,237,224,0.1)'}`,
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontFamily: 'sans-serif',
                    cursor: 'pointer',
                  }}
                >
                  {c.is_active ? 'Active' : 'Paused'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
