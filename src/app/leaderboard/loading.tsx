export default function Loading() {
  return (
    <main style={{ minHeight: '100vh', padding: '80px 32px 120px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div className="skeleton" style={{ width: '100px', height: '9px' }} />
        <div className="skeleton" style={{ width: '80px', height: '9px' }} />
      </div>
      <div className="skeleton" style={{ width: '360px', height: '72px', marginBottom: '20px' }} />
      <div className="skeleton" style={{ width: '480px', height: '40px', marginBottom: '56px' }} />

      {/* Tab row */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '32px', borderBottom: '1px solid rgba(245,237,224,0.07)' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ width: '100px', height: '32px', marginRight: '2px' }} />
        ))}
      </div>

      {/* Top 3 podium */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '24px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: '96px' }} />
        ))}
      </div>

      {/* List rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', borderBottom: '1px solid rgba(245,237,224,0.04)' }}>
            <div className="skeleton" style={{ width: '24px', height: '16px', flexShrink: 0 }} />
            <div className="skeleton" style={{ flex: 1, height: '13px' }} />
            <div className="skeleton" style={{ width: '60px', height: '13px' }} />
          </div>
        ))}
      </div>
    </main>
  )
}
