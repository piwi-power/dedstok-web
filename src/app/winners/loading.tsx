export default function Loading() {
  return (
    <main style={{ minHeight: '100vh', padding: '56px 32px 120px', maxWidth: '900px', margin: '0 auto' }}>
      <div className="skeleton" style={{ width: '48px', height: '10px', marginBottom: '40px' }} />
      <div className="skeleton" style={{ width: '72px', height: '9px', marginBottom: '12px' }} />
      <div className="skeleton" style={{ width: '240px', height: '72px', marginBottom: '32px' }} />
      <div className="skeleton" style={{ width: '320px', height: '9px', marginBottom: '56px' }} />

      <div style={{ display: 'grid', gap: '2px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ padding: '28px 0', borderBottom: '1px solid rgba(245,237,224,0.06)' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div className="skeleton" style={{ flexShrink: 0, width: '88px', height: '88px' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '120px', height: '9px', marginBottom: '12px' }} />
                <div className="skeleton" style={{ width: '200px', height: '20px', marginBottom: '10px' }} />
                <div className="skeleton" style={{ width: '100px', height: '10px' }} />
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className="skeleton" style={{ width: '40px', height: '9px', marginBottom: '10px', marginLeft: 'auto' }} />
                <div className="skeleton" style={{ width: '120px', height: '13px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="skeleton" style={{ width: '120px', height: '44px' }} />
              <div className="skeleton" style={{ width: '200px', height: '44px' }} />
              <div className="skeleton" style={{ width: '72px', height: '44px' }} />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
