export default function Loading() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <div className="skeleton" style={{ width: '80px', height: '14px', marginBottom: '48px' }} />
        <div style={{ width: '32px', height: '1px', background: 'rgba(202,138,4,0.2)', marginBottom: '24px' }} />
        <div className="skeleton" style={{ width: '200px', height: '28px', marginBottom: '12px' }} />
        <div className="skeleton" style={{ width: '100%', height: '52px', marginBottom: '8px', marginTop: '40px' }} />
        <div className="skeleton" style={{ width: '160px', height: '10px', marginBottom: '32px' }} />
        <div className="skeleton" style={{ width: '100%', height: '52px' }} />
      </div>
    </main>
  )
}
