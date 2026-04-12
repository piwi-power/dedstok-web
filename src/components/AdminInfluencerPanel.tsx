'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface InfluencerCode {
  id: string
  code: string
  influencer_name: string
  instagram_handle: string | null
  commission_rate: number
  total_tickets_credited: number
  total_commission_earned: number
  total_pending_payout: number
  last_payout_date: string | null
  is_active: boolean
  user_id: string | null
}

interface Props {
  codes: InfluencerCode[]
}

export default function AdminInfluencerPanel({ codes: initialCodes }: Props) {
  const router = useRouter()
  const [codes, setCodes] = useState(initialCodes)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', instagram: '', commission_rate: '10' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [linkForm, setLinkForm] = useState<{ code: string; email: string } | null>(null)
  const [linkMsg, setLinkMsg] = useState('')

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

  async function createCode() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/influencer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        name: form.name,
        instagram: form.instagram,
        commission_rate: parseFloat(form.commission_rate) / 100,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Failed')
    } else {
      setCreating(false)
      setForm({ name: '', instagram: '', commission_rate: '10' })
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

  async function markPaid(code: string) {
    const res = await fetch('/api/admin/influencer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_paid', code }),
    })
    if (res.ok) {
      setCodes(prev => prev.map(c => c.code === code
        ? { ...c, total_pending_payout: 0, last_payout_date: new Date().toISOString().split('T')[0] }
        : c
      ))
    }
  }

  async function linkUser() {
    if (!linkForm) return
    setLinkMsg('')
    const res = await fetch('/api/admin/influencer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'link_user', ...linkForm }),
    })
    const data = await res.json()
    if (!res.ok) {
      setLinkMsg(data.error ?? 'Failed')
    } else {
      setLinkMsg('Linked successfully.')
      setLinkForm(null)
      router.refresh()
    }
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px', gap: '12px', marginBottom: '12px' }}>
            <div>
              <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '4px' }}>Name</p>
              <input style={input} placeholder="Influencer name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '4px' }}>Instagram</p>
              <input style={input} placeholder="@handle" value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} />
            </div>
            <div>
              <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '4px' }}>Commission %</p>
              <input style={input} type="number" min="1" max="50" step="1" value={form.commission_rate} onChange={e => setForm(f => ({ ...f, commission_rate: e.target.value }))} />
            </div>
          </div>
          {form.name && (
            <p style={{ color: 'rgba(245,237,224,0.3)', fontSize: '11px', fontFamily: 'monospace', marginBottom: '12px' }}>
              Code preview: {form.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)}
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

      {/* Link user modal */}
      {linkForm && (
        <div style={{ border: '1px solid rgba(202,138,4,0.2)', borderRadius: '4px', padding: '20px', marginBottom: '16px' }}>
          <p style={{ color: 'rgba(245,237,224,0.5)', fontSize: '12px', fontFamily: 'sans-serif', marginBottom: '12px' }}>
            Link DEDSTOK account to <strong style={{ color: '#CA8A04' }}>{linkForm.code}</strong>
          </p>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <input
              style={{ ...input, flex: 1 }}
              placeholder="influencer@email.com"
              value={linkForm.email}
              onChange={e => setLinkForm(f => f ? { ...f, email: e.target.value } : null)}
            />
            <button onClick={linkUser} style={{ background: '#CA8A04', color: '#0c0a09', border: 'none', borderRadius: '4px', padding: '8px 16px', fontSize: '12px', fontWeight: 700, fontFamily: 'sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Link Account
            </button>
            <button onClick={() => { setLinkForm(null); setLinkMsg('') }} style={{ background: 'transparent', color: 'rgba(245,237,224,0.4)', border: '1px solid rgba(245,237,224,0.1)', borderRadius: '4px', padding: '8px 12px', fontSize: '12px', fontFamily: 'sans-serif', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
          {linkMsg && <p style={{ color: linkMsg.includes('success') ? '#22c55e' : '#ef4444', fontSize: '12px', fontFamily: 'sans-serif' }}>{linkMsg}</p>}
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
            <div key={c.id} style={{ borderBottom: i < codes.length - 1 ? '1px solid rgba(245,237,224,0.06)' : 'none' }}>
              {/* Main row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '130px 1fr 80px 110px 110px 90px 90px',
                  padding: '14px 20px',
                  alignItems: 'center',
                  gap: '0',
                }}
              >
                <p style={{ color: '#CA8A04', fontFamily: 'monospace', fontSize: '13px', fontWeight: 700 }}>{c.code}</p>
                <div>
                  <p style={{ color: '#f5ede0', fontSize: '13px', fontFamily: 'sans-serif' }}>{c.influencer_name}</p>
                  {c.instagram_handle && (
                    <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '11px', fontFamily: 'sans-serif' }}>{c.instagram_handle}</p>
                  )}
                  <p style={{ color: c.user_id ? '#22c55e' : 'rgba(245,237,224,0.25)', fontSize: '10px', fontFamily: 'sans-serif', marginTop: '2px' }}>
                    {c.user_id ? 'Account linked' : 'No account linked'}
                  </p>
                </div>
                <p style={{ color: 'rgba(245,237,224,0.5)', fontSize: '12px', fontFamily: 'sans-serif', textAlign: 'right' }}>
                  {c.total_tickets_credited} tickets
                </p>
                <p style={{ color: '#f5ede0', fontSize: '12px', fontFamily: 'sans-serif', textAlign: 'right' }}>
                  ${c.total_commission_earned.toFixed(2)} total
                </p>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: c.total_pending_payout > 0 ? '#CA8A04' : 'rgba(245,237,224,0.3)', fontSize: '12px', fontFamily: 'sans-serif', fontWeight: c.total_pending_payout > 0 ? 700 : 400 }}>
                    ${c.total_pending_payout.toFixed(2)} due
                  </p>
                  {c.last_payout_date && (
                    <p style={{ color: 'rgba(245,237,224,0.25)', fontSize: '10px', fontFamily: 'sans-serif' }}>
                      Paid {c.last_payout_date}
                    </p>
                  )}
                </div>
                <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '11px', fontFamily: 'sans-serif', textAlign: 'right' }}>
                  {Math.round(c.commission_rate * 100)}%
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
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
                  {c.total_pending_payout > 0 && (
                    <button
                      onClick={() => markPaid(c.code)}
                      style={{
                        background: 'rgba(202,138,4,0.15)',
                        color: '#CA8A04',
                        border: '1px solid rgba(202,138,4,0.3)',
                        borderRadius: '4px',
                        padding: '4px 10px',
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        fontFamily: 'sans-serif',
                        cursor: 'pointer',
                      }}
                    >
                      Mark Paid
                    </button>
                  )}
                  {!c.user_id && (
                    <button
                      onClick={() => setLinkForm({ code: c.code, email: '' })}
                      style={{
                        background: 'transparent',
                        color: 'rgba(245,237,224,0.3)',
                        border: '1px solid rgba(245,237,224,0.1)',
                        borderRadius: '4px',
                        padding: '4px 10px',
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        fontFamily: 'sans-serif',
                        cursor: 'pointer',
                      }}
                    >
                      Link Account
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
