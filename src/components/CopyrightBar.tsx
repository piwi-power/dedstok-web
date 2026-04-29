export default function CopyrightBar() {
  return (
    <div
      style={{
        borderTop: '1px solid rgba(245,237,224,0.05)',
        padding: '18px clamp(20px,4vw,48px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '9px',
          letterSpacing: '0.08em',
          color: 'rgba(245,237,224,0.3)',
        }}
      >
        © 2026 DEDSTOK. All rights reserved.
      </span>
      <span
        style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '9px',
          letterSpacing: '0.1em',
          color: 'var(--gold)',
          opacity: 0.55,
          textTransform: 'uppercase',
        }}
      >
        Beirut, Lebanon
      </span>
    </div>
  )
}
