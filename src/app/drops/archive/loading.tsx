export default function Loading() {
  return (
    <main style={{ minHeight: '100vh', padding: '80px 32px 120px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="skeleton" style={{ width: '160px', height: '9px', marginBottom: '16px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div className="skeleton" style={{ width: '320px', height: '80px' }} />
        <div className="skeleton" style={{ width: '80px', height: '9px' }} />
      </div>

      {/* Active drop card */}
      <div className="skeleton" style={{ width: '100%', height: '76px', marginBottom: '56px' }} />

      {/* Section divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div className="skeleton" style={{ width: '80px', height: '9px', flexShrink: 0 }} />
        <div style={{ flex: 1, height: '1px', background: 'rgba(245,237,224,0.05)' }} />
        <div className="skeleton" style={{ width: '48px', height: '9px', flexShrink: 0 }} />
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{ border: '1px solid rgba(245,237,224,0.05)', overflow: 'hidden' }}>
            <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9' }} />
            <div style={{ padding: '20px' }}>
              <div className="skeleton" style={{ width: '80%', height: '18px', marginBottom: '20px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div className="skeleton" style={{ height: '36px' }} />
                <div className="skeleton" style={{ height: '36px' }} />
              </div>
              <div className="skeleton" style={{ width: '100px', height: '9px' }} />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
