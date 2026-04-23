export default function Loading() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '96px 24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div className="skeleton" style={{ width: '48px', height: '10px', marginBottom: '40px' }} />
        <div style={{ border: '1px solid rgba(245,237,224,0.06)', padding: '40px' }}>
          <div className="skeleton" style={{ width: '80px', height: '9px', marginBottom: '20px' }} />
          <div className="skeleton" style={{ width: '200px', height: '24px', marginBottom: '40px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="skeleton" style={{ width: '80px', height: '13px' }} />
                <div className="skeleton" style={{ width: '40px', height: '13px' }} />
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(245,237,224,0.06)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between' }}>
              <div className="skeleton" style={{ width: '60px', height: '13px' }} />
              <div className="skeleton" style={{ width: '56px', height: '22px' }} />
            </div>
          </div>
          <div className="skeleton" style={{ width: '100%', height: '56px', marginTop: '8px' }} />
        </div>
      </div>
    </main>
  )
}
