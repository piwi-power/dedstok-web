'use client'

import { useState } from 'react'

interface Drop {
  id: string
  item_name: string
  slug: string
  description: string | null
  entry_price: number
  total_spots: number
  spots_sold: number
  draw_date: string
  market_value: number | null
  sourcing_tier: string | null
  status: string
  created_at: string
  image_url?: string | null
}

interface Props {
  drops: Drop[]
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  scheduled: { bg: 'rgba(245,237,224,0.08)', color: 'rgba(245,237,224,0.5)' },
  active:    { bg: 'rgba(34,197,94,0.15)',    color: '#22c55e' },
  closed:    { bg: 'rgba(245,237,224,0.06)',  color: 'rgba(245,237,224,0.3)' },
  drawn:     { bg: 'rgba(202,138,4,0.15)',    color: '#CA8A04' },
}

const STATUSES = ['scheduled', 'active', 'closed', 'drawn']

const emptyForm = {
  item_name: '', slug: '', description: '', entry_price: '',
  total_spots: '', draw_date: '', market_value: '', sourcing_tier: '', status: 'scheduled', image_url: '',
}

export default function AdminDropPanel({ drops: initialDrops }: Props) {
  const [drops, setDrops] = useState<Drop[]>(initialDrops)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function openCreate() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
    setError(null)
  }

  function openEdit(drop: Drop) {
    setForm({
      item_name: drop.item_name,
      slug: drop.slug,
      description: drop.description ?? '',
      entry_price: String(drop.entry_price),
      total_spots: String(drop.total_spots),
      draw_date: drop.draw_date.slice(0, 16), // datetime-local format
      market_value: drop.market_value ? String(drop.market_value) : '',
      sourcing_tier: drop.sourcing_tier ?? '',
      status: drop.status,
      image_url: drop.image_url ?? '',
    })
    setEditingId(drop.id)
    setShowForm(true)
    setError(null)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setError(null)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const method = editingId ? 'PATCH' : 'POST'
    const body = editingId ? { drop_id: editingId, ...form } : form

    const res = await fetch('/api/admin/drops', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      return
    }

    setSuccess(editingId ? 'Drop updated.' : 'Drop created.')
    setTimeout(() => setSuccess(null), 3000)
    setShowForm(false)
    setEditingId(null)

    // Refresh by reloading the page — simplest approach
    window.location.reload()
  }

  async function handleDelete(dropId: string) {
    setDeleting(dropId)
    setError(null)

    const res = await fetch('/api/admin/drops', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drop_id: dropId }),
    })
    const data = await res.json()
    setDeleting(null)
    setConfirmDelete(null)

    if (!res.ok) {
      setError(data.error ?? 'Could not delete drop')
      return
    }

    setDrops(prev => prev.filter(d => d.id !== dropId))
    setSuccess('Drop deleted.')
    setTimeout(() => setSuccess(null), 3000)
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(245,237,224,0.04)',
    border: '1px solid rgba(245,237,224,0.12)',
    borderRadius: '4px',
    padding: '8px 12px',
    color: '#f5ede0',
    fontSize: '13px',
    fontFamily: 'sans-serif',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    color: 'rgba(245,237,224,0.35)',
    fontSize: '10px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    fontFamily: 'sans-serif',
    display: 'block',
    marginBottom: '4px',
  }

  return (
    <section style={{ marginBottom: '48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          All Drops
        </p>
        <button
          onClick={openCreate}
          style={{ background: '#CA8A04', color: '#0c0a09', border: 'none', borderRadius: '4px', padding: '7px 16px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'sans-serif', cursor: 'pointer' }}
        >
          + New Drop
        </button>
      </div>

      {success && (
        <p style={{ color: '#22c55e', fontSize: '12px', fontFamily: 'sans-serif', marginBottom: '12px' }}>{success}</p>
      )}
      {error && !showForm && (
        <p style={{ color: '#f87171', fontSize: '12px', fontFamily: 'sans-serif', marginBottom: '12px' }}>{error}</p>
      )}

      {/* Create / Edit form */}
      {showForm && (
        <div style={{ border: '1px solid rgba(202,138,4,0.3)', borderRadius: '4px', padding: '24px', marginBottom: '20px' }}>
          <p style={{ color: '#CA8A04', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '20px' }}>
            {editingId ? 'Edit Drop' : 'New Drop'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Item Name *</label>
              <input style={inputStyle} value={form.item_name} onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))} placeholder="Air Jordan 1 Retro High OG" />
            </div>
            <div>
              <label style={labelStyle}>Slug (auto if empty)</label>
              <input style={inputStyle} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="air-jordan-1-retro-high-og" />
            </div>
            <div>
              <label style={labelStyle}>Entry Price (USD) *</label>
              <input style={inputStyle} type="number" min="1" value={form.entry_price} onChange={e => setForm(f => ({ ...f, entry_price: e.target.value }))} placeholder="10" />
            </div>
            <div>
              <label style={labelStyle}>Total Spots *</label>
              <input style={inputStyle} type="number" min="1" value={form.total_spots} onChange={e => setForm(f => ({ ...f, total_spots: e.target.value }))} placeholder="100" />
            </div>
            <div>
              <label style={labelStyle}>Draw Date *</label>
              <input style={inputStyle} type="datetime-local" value={form.draw_date} onChange={e => setForm(f => ({ ...f, draw_date: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Market Value (USD)</label>
              <input style={inputStyle} type="number" min="0" value={form.market_value} onChange={e => setForm(f => ({ ...f, market_value: e.target.value }))} placeholder="350" />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Sourcing Tier</label>
              <select style={inputStyle} value={form.sourcing_tier} onChange={e => setForm(f => ({ ...f, sourcing_tier: e.target.value }))}>
                <option value="">None</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Image URL</label>
            <input style={inputStyle} value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description shown on the drop page..." />
          </div>

          {error && (
            <p style={{ color: '#f87171', fontSize: '12px', fontFamily: 'sans-serif', marginBottom: '12px' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ background: '#CA8A04', color: '#0c0a09', border: 'none', borderRadius: '4px', padding: '9px 20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'sans-serif', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Drop'}
            </button>
            <button
              onClick={cancelForm}
              style={{ background: 'transparent', color: 'rgba(245,237,224,0.4)', border: '1px solid rgba(245,237,224,0.15)', borderRadius: '4px', padding: '9px 20px', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'sans-serif', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Drops list */}
      {drops.length === 0 ? (
        <div style={{ border: '1px solid rgba(245,237,224,0.08)', borderRadius: '4px', padding: '32px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(245,237,224,0.3)', fontSize: '13px' }}>No drops yet. Create one above.</p>
        </div>
      ) : (
        drops.map(drop => {
          const sc = STATUS_COLORS[drop.status] ?? STATUS_COLORS.scheduled
          const isConfirmingDelete = confirmDelete === drop.id
          const isDeleting = deleting === drop.id

          return (
            <div key={drop.id} style={{ border: '1px solid rgba(245,237,224,0.08)', borderRadius: '4px', padding: '18px 20px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <p style={{ color: '#f5ede0', fontSize: '14px', fontWeight: 600, fontFamily: 'sans-serif' }}>
                      {drop.item_name}
                    </p>
                    <span style={{ background: sc.bg, color: sc.color, fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '2px', fontFamily: 'sans-serif', whiteSpace: 'nowrap' }}>
                      {drop.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <span style={{ color: 'rgba(245,237,224,0.4)', fontSize: '11px', fontFamily: 'sans-serif' }}>
                      ${drop.entry_price} / spot
                    </span>
                    <span style={{ color: 'rgba(245,237,224,0.4)', fontSize: '11px', fontFamily: 'sans-serif' }}>
                      {drop.spots_sold} / {drop.total_spots} spots sold
                    </span>
                    <span style={{ color: 'rgba(245,237,224,0.4)', fontSize: '11px', fontFamily: 'sans-serif' }}>
                      Draw: {new Date(drop.draw_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {drop.market_value && (
                      <span style={{ color: 'rgba(245,237,224,0.4)', fontSize: '11px', fontFamily: 'sans-serif' }}>
                        MV: ${drop.market_value}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginLeft: '16px', flexShrink: 0 }}>
                  <button
                    onClick={() => openEdit(drop)}
                    style={{ background: 'transparent', color: 'rgba(245,237,224,0.5)', border: '1px solid rgba(245,237,224,0.15)', borderRadius: '4px', padding: '5px 12px', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'sans-serif', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                  {drop.status !== 'drawn' && (
                    <button
                      onClick={() => setConfirmDelete(isConfirmingDelete ? null : drop.id)}
                      style={{ background: 'transparent', color: isConfirmingDelete ? '#f87171' : 'rgba(245,237,224,0.3)', border: `1px solid ${isConfirmingDelete ? 'rgba(239,68,68,0.4)' : 'rgba(245,237,224,0.1)'}`, borderRadius: '4px', padding: '5px 12px', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'sans-serif', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Delete confirmation inline */}
              {isConfirmingDelete && (
                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <p style={{ color: 'rgba(245,237,224,0.6)', fontSize: '12px', fontFamily: 'sans-serif', flex: 1 }}>
                    This deletes the drop and all its entries permanently. Cannot be undone.
                  </p>
                  <button
                    onClick={() => handleDelete(drop.id)}
                    disabled={isDeleting}
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '4px', padding: '5px 14px', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'sans-serif', cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.5 : 1 }}
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    style={{ background: 'transparent', color: 'rgba(245,237,224,0.35)', border: '1px solid rgba(245,237,224,0.1)', borderRadius: '4px', padding: '5px 14px', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'sans-serif', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )
        })
      )}
    </section>
  )
}
