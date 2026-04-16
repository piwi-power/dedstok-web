// Internal — Remove Before Launch

export default function FontsPage() {
  const label: React.CSSProperties = {
    fontFamily: 'var(--font-dm-mono)',
    fontSize: '8px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'rgba(245,237,224,0.25)',
    marginBottom: '16px',
  }

  const tag: React.CSSProperties = {
    fontFamily: 'var(--font-dm-mono)',
    fontSize: '10px',
    color: 'rgba(245,237,224,0.28)',
    lineHeight: 1.75,
    maxWidth: '500px',
    marginTop: '16px',
  }

  const divider: React.CSSProperties = {
    marginBottom: '100px',
    paddingBottom: '100px',
    borderBottom: '1px solid rgba(245,237,224,0.06)',
  }

  const bagBox: React.CSSProperties = {
    background: '#0c0a09',
    border: '1px solid rgba(245,237,224,0.08)',
    padding: '48px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '400px',
    marginBottom: '40px',
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: '80px 48px 120px' }}>

      <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>
        Internal — Remove Before Launch
      </p>
      <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,237,224,0.2)', marginBottom: '80px' }}>
        LOCKED: Anton · All brand contexts
      </p>

      {/* ══════════════════════════════════════════
          OPTION 1 — BEBAS NEUE OUTLINE
          Kept for reference / secondary use only
         ══════════════════════════════════════════ */}
      <section style={divider}>
        <p style={label}>Option 1 — Bebas Neue · Outline · Secondary use only</p>

        <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '96px', letterSpacing: '0.35em', color: 'transparent', WebkitTextStroke: '1px var(--cream)', lineHeight: 1, marginBottom: '20px' }}>
          DEDSTOK
        </div>
        <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '96px', letterSpacing: '0.35em', color: 'transparent', WebkitTextStroke: '1px var(--gold)', lineHeight: 1, marginBottom: '28px' }}>
          DEDSTOK
        </div>

        <p style={tag}>
          Background texture, watermark, or secondary graphic behind Anton solid type.
          Not a primary brand application.
        </p>
      </section>

      {/* ══════════════════════════════════════════
          LOCKED — ANTON
          Primary brand font. All display, wordmark,
          packaging, and hero contexts.
         ══════════════════════════════════════════ */}
      <section style={divider}>
        <p style={label}>LOCKED — Anton · Primary brand font</p>

        {/* Solid fill */}
        <div style={{ fontFamily: 'var(--font-anton)', fontSize: '96px', letterSpacing: '0.02em', color: 'var(--cream)', lineHeight: 1, marginBottom: '8px' }}>
          DEDSTOK
        </div>
        <div style={{ fontFamily: 'var(--font-anton)', fontSize: '36px', letterSpacing: '0.04em', color: 'rgba(245,237,224,0.35)', lineHeight: 1, marginBottom: '40px' }}>
          ONE DROP. ONE WINNER.
        </div>

        {/* Outline — cream */}
        <p style={label}>Outline — cream</p>
        <div style={{ fontFamily: 'var(--font-anton)', fontSize: '96px', letterSpacing: '0.02em', color: 'transparent', WebkitTextStroke: '1.5px var(--cream)', lineHeight: 1, marginBottom: '20px' }}>
          DEDSTOK
        </div>

        {/* Outline — gold */}
        <p style={label}>Outline — gold</p>
        <div style={{ fontFamily: 'var(--font-anton)', fontSize: '96px', letterSpacing: '0.02em', color: 'transparent', WebkitTextStroke: '1.5px var(--gold)', lineHeight: 1, marginBottom: '28px' }}>
          DEDSTOK
        </div>

        <p style={tag}>
          Solid: default on all dark backgrounds — nav, hero, drop cards, hero sections.
          Outline: design element. Appears behind solid type, on tissue paper, secondary contexts.
          Gold outline: brand stamp feeling — hangtags, wax seals, premium packaging inserts.
        </p>
      </section>

      {/* ══════════════════════════════════════════
          BAGS / PACKAGING
         ══════════════════════════════════════════ */}
      <section style={{ marginBottom: '100px' }}>
        <p style={label}>Bags / Packaging — Anton on product</p>

        {/* Version A: Solid fill */}
        <p style={{ ...label, marginBottom: '20px' }}>Version A — Solid fill · Default</p>
        <div style={bagBox}>
          <div style={{ fontFamily: 'var(--font-anton)', fontSize: '72px', letterSpacing: '0.02em', color: 'var(--cream)', lineHeight: 1, marginBottom: '10px', textAlign: 'center' }}>
            DEDSTOK
          </div>
          <div style={{ fontFamily: 'var(--font-anton)', fontSize: '13px', letterSpacing: '0.14em', color: 'rgba(245,237,224,0.3)', lineHeight: 1, textAlign: 'center' }}>
            ONE DROP. ONE WINNER. EVERY WEEK.
          </div>
        </div>

        {/* Version B: Cream outline */}
        <p style={{ ...label, marginBottom: '20px' }}>Version B — Cream outline · Tissue paper / interior</p>
        <div style={bagBox}>
          <div style={{ fontFamily: 'var(--font-anton)', fontSize: '72px', letterSpacing: '0.02em', color: 'transparent', WebkitTextStroke: '1.5px var(--cream)', lineHeight: 1, marginBottom: '10px', textAlign: 'center' }}>
            DEDSTOK
          </div>
          <div style={{ fontFamily: 'var(--font-anton)', fontSize: '13px', letterSpacing: '0.14em', color: 'rgba(245,237,224,0.3)', lineHeight: 1, textAlign: 'center' }}>
            ONE DROP. ONE WINNER. EVERY WEEK.
          </div>
        </div>

        {/* Version C: Gold outline */}
        <p style={{ ...label, marginBottom: '20px' }}>Version C — Gold outline · Hangtags / premium inserts</p>
        <div style={bagBox}>
          <div style={{ fontFamily: 'var(--font-anton)', fontSize: '72px', letterSpacing: '0.02em', color: 'transparent', WebkitTextStroke: '1.5px var(--gold)', lineHeight: 1, marginBottom: '10px', textAlign: 'center' }}>
            DEDSTOK
          </div>
          <div style={{ fontFamily: 'var(--font-anton)', fontSize: '13px', letterSpacing: '0.14em', color: 'rgba(245,237,224,0.3)', lineHeight: 1, textAlign: 'center' }}>
            ONE DROP. ONE WINNER. EVERY WEEK.
          </div>
        </div>

        {/* Version D: Gold block stamp */}
        <p style={{ ...label, marginBottom: '20px' }}>Version D — Gold block stamp · Stickers / wax seals / packaging inserts</p>
        <div style={{ ...bagBox, background: 'var(--gold)', border: 'none' }}>
          <div style={{ fontFamily: 'var(--font-anton)', fontSize: '72px', letterSpacing: '0.02em', color: '#0c0a09', lineHeight: 1, marginBottom: '8px', textAlign: 'center' }}>
            DEDSTOK
          </div>
          <div style={{ fontFamily: 'var(--font-anton)', fontSize: '13px', letterSpacing: '0.14em', color: 'rgba(12,10,9,0.5)', lineHeight: 1, textAlign: 'center' }}>
            ONE DROP. ONE WINNER. EVERY WEEK.
          </div>
        </div>
      </section>

    </main>
  )
}
