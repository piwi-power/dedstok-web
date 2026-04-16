// DEDSTOK — Brand Preview Page
// Internal reference only. Remove before launch.
// Route: /brand

export const metadata = { title: 'Brand System | DEDSTOK' }

const colors = [
  { token: '--bg',          hex: '#0c0a09',  label: 'BG',           role: 'Vault floor' },
  { token: '--bg-dark',     hex: '#0a0804',  label: 'BG DARK',      role: 'Nav, overlays' },
  { token: '--walnut',      hex: '#1C1917',  label: 'WALNUT',       role: 'Cards, panels' },
  { token: '--walnut-mid',  hex: '#2c1f12',  label: 'WALNUT MID',   role: 'Default borders' },
  { token: '--walnut-warm', hex: '#3d2b1a',  label: 'WALNUT WARM',  role: 'Hover surfaces' },
  { token: '--gold',        hex: '#CA8A04',  label: 'GOLD',         role: 'CTAs, highlights' },
  { token: '--gold-light',  hex: '#e8b830',  label: 'GOLD LIGHT',   role: 'Gold hover state' },
  { token: '--cream',       hex: '#f5ede0',  label: 'CREAM',        role: 'Primary text' },
  { token: '--signal',      hex: '#c2410c',  label: 'SIGNAL',       role: 'Urgency states' },
]

const typeScale = [
  { label: 'Wordmark', font: 'var(--font-anton)',   size: '80px',  weight: '400', tracking: '0.02em', sample: 'DEDSTOK',       note: 'Brand name. Nav. Hero. Rank numbers. Commerce page headings.' },
  { label: 'Display',  font: 'var(--font-bebas)',   size: '64px',  weight: '400', tracking: '0',      sample: '05:47:12',      note: 'Countdown timer and large display numbers ONLY.' },
  { label: 'H1 Editorial', font: 'var(--font-bodoni)',            size: '48px',  weight: '700', tracking: '-0.5px', sample: 'The Archive',        note: 'Editorial ONLY. Articles. Brand quotes. Never product names.' },
  { label: 'Product Name', font: 'var(--font-barlow-condensed)', size: '36px',  weight: '700', tracking: '0.01em', sample: 'Nike Dunk Low Panda', note: 'LOCKED. Drop titles, product names on cards. Cold. Streetwear-credible.' },
  { label: 'Body',     font: 'var(--font-jost)',    size: '16px',  weight: '400', tracking: '0',      sample: 'One item. Sourced and in hand before the drop is announced. Winner selected by cryptographically verifiable random draw.', note: '' },
  { label: 'Small',    font: 'var(--font-jost)',    size: '13px',  weight: '400', tracking: '0',      sample: 'Supporting information and secondary copy at reduced scale.', note: '' },
  { label: 'Label',    font: 'var(--font-dm-mono)', size: '10px',  weight: '400', tracking: '0.2em',  sample: 'ENTRY PRICE',   note: 'All-caps labels, tabs, status indicators.' },
  { label: 'Data',     font: 'var(--font-dm-mono)', size: '16px',  weight: '500', tracking: '0',      sample: '#0247',         note: 'Ticket numbers, referral codes, data fields.' },
]

export default function BrandPage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', padding: '80px 40px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '96px', borderBottom: '1px solid var(--walnut-mid)', paddingBottom: '48px' }}>
        <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '16px' }}>
          Internal Reference — Remove Before Launch
        </p>
        <h1 style={{ fontFamily: 'var(--font-bodoni)', fontSize: '56px', fontWeight: 700, color: 'var(--cream)', lineHeight: 1.1, marginBottom: '16px' }}>
          Brand System
        </h1>
        <p style={{ fontFamily: 'var(--font-jost)', fontSize: '16px', color: 'var(--cream-dim)', lineHeight: 1.6 }}>
          DEDSTOK v1.0 — Locked April 2026. Every decision is intentional and backed by research.<br />
          Full rationale in <code style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '13px', color: 'var(--gold-dim)' }}>BRANDING.md</code>
        </p>
      </div>

      {/* Positioning */}
      <section style={{ marginBottom: '96px' }}>
        <SectionLabel>Brand Positioning</SectionLabel>
        <blockquote style={{
          borderLeft: '2px solid var(--gold)',
          paddingLeft: '32px',
          margin: '32px 0',
        }}>
          <p style={{ fontFamily: 'var(--font-bodoni)', fontSize: '28px', fontStyle: 'italic', color: 'var(--cream)', lineHeight: 1.4 }}>
            "Christie's auction house meets Supreme black label."
          </p>
        </blockquote>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <InfoCard label="Core Metaphor" value="The Vault" sub="One item inside. You can see it. One person gets it." />
          <InfoCard label="Archetype" value="Outlaw / Ruler" sub="Disrupts gatekeeping. Enforces scarcity with authority." />
          <InfoCard label="Tagline" value="One drop. One winner. Every week." sub="Use in full. Never shorten. The three periods are intentional." />
          <InfoCard label="Market" value="Lebanon first. MENA second." sub="Christie's + Supreme — a pairing that exists nowhere else in the region." />
        </div>
      </section>

      {/* Colors */}
      <section style={{ marginBottom: '96px' }}>
        <SectionLabel>Color System</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '32px' }}>
          {colors.map(c => (
            <div key={c.token} style={{ border: '1px solid var(--walnut-mid)' }}>
              <div style={{ background: c.hex, height: '80px', width: '100%' }} />
              <div style={{ padding: '16px', background: 'var(--walnut)' }}>
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>
                  {c.label}
                </p>
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'var(--cream)', marginBottom: '4px' }}>
                  {c.hex}
                </p>
                <p style={{ fontFamily: 'var(--font-jost)', fontSize: '11px', color: 'var(--cream-dim)' }}>
                  {c.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Accessibility note */}
        <div style={{ marginTop: '24px', padding: '16px 20px', border: '1px solid var(--walnut-mid)', background: 'var(--walnut)' }}>
          <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '6px' }}>
            Accessibility Rule
          </p>
          <p style={{ fontFamily: 'var(--font-jost)', fontSize: '13px', color: 'var(--cream-dim)', lineHeight: 1.6 }}>
            Gold text is only permitted on surfaces at or darker than <code style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--cream)' }}>--walnut</code> (#1C1917).
            Contrast ratio on <code style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--cream)' }}>--bg</code> is ~7:1 (WCAG AAA).
            Never use gold text on <code style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--cream)' }}>--walnut-warm</code> or lighter.
          </p>
        </div>
      </section>

      {/* Typography */}
      <section style={{ marginBottom: '96px' }}>
        <SectionLabel>Typography System</SectionLabel>
        <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '0' }}>
          {typeScale.map((t) => (
            <div key={t.label} style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr 280px',
              gap: '24px',
              alignItems: 'center',
              padding: '28px 0',
              borderBottom: '1px solid var(--walnut-mid)',
            }}>
              <div>
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: t.label === 'Wordmark' ? 'var(--gold)' : 'var(--gold)', marginBottom: '4px' }}>
                  {t.label}
                </p>
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--cream-dim)' }}>
                  {t.size}
                </p>
              </div>
              <p style={{
                fontFamily: t.font,
                fontSize: t.size,
                fontWeight: t.weight,
                letterSpacing: t.tracking,
                color: 'var(--cream)',
                lineHeight: 1.2,
                textTransform: t.label === 'Label' || t.label === 'Wordmark' || t.label === 'Display' ? 'uppercase' : 'none',
              }}>
                {t.sample}
              </p>
              {t.note ? (
                <p style={{ fontFamily: 'var(--font-jost)', fontSize: '12px', color: 'rgba(245,237,224,0.25)', lineHeight: 1.5 }}>
                  {t.note}
                </p>
              ) : <div />}
            </div>
          ))}
        </div>

        {/* Font pairing rule */}
        <div style={{ marginTop: '24px', padding: '20px', border: '1px solid var(--signal)', background: 'rgba(194,65,12,0.06)' }}>
          <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--signal)', marginBottom: '8px' }}>
            Pairing Rule — Critical
          </p>
          <p style={{ fontFamily: 'var(--font-jost)', fontSize: '13px', color: 'var(--cream-dim)', lineHeight: 1.6 }}>
            Anton is the brand voice. Bodoni is the editorial voice. They do not share a page at the same scale.<br />
            Anton at hero size + Bodoni at H1 size on the same screen = visual conflict. Use one as primary, the other absent or at a much smaller scale.<br />
            Bebas Neue is for numbers only — countdown and data display. Never use it for words.
          </p>
        </div>
      </section>

      {/* Buttons */}
      <section style={{ marginBottom: '96px' }}>
        <SectionLabel>Button System</SectionLabel>
        <div style={{ marginTop: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Primary */}
          <button style={{
            background: 'var(--gold)', color: 'var(--bg)',
            fontFamily: 'var(--font-jost)', fontWeight: 600, fontSize: '13px',
            textTransform: 'uppercase', letterSpacing: '0.15em',
            padding: '14px 32px', borderRadius: '2px', border: 'none', cursor: 'pointer',
          }}>
            Enter the Drop
          </button>

          {/* Secondary */}
          <button style={{
            background: 'transparent', color: 'var(--cream)',
            fontFamily: 'var(--font-jost)', fontWeight: 600, fontSize: '13px',
            textTransform: 'uppercase', letterSpacing: '0.15em',
            padding: '14px 32px', borderRadius: '2px',
            border: '1px solid rgba(245,237,224,0.25)', cursor: 'pointer',
          }}>
            View Archive
          </button>

          {/* Ghost */}
          <button style={{
            background: 'transparent', color: 'var(--cream-dim)',
            fontFamily: 'var(--font-jost)', fontWeight: 400, fontSize: '13px',
            padding: '8px 16px', borderRadius: '2px',
            border: 'none', cursor: 'pointer',
          }}>
            Skip for now
          </button>

          {/* Disabled */}
          <button style={{
            background: 'var(--gold)', color: 'var(--bg)',
            fontFamily: 'var(--font-jost)', fontWeight: 600, fontSize: '13px',
            textTransform: 'uppercase', letterSpacing: '0.15em',
            padding: '14px 32px', borderRadius: '2px', border: 'none',
            opacity: 0.4, cursor: 'not-allowed',
          }} disabled>
            Entry Closed.
          </button>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '16px' }}>
          {/* Badge examples */}
          <span style={{
            display: 'inline-block', fontFamily: 'var(--font-dm-mono)', fontSize: '8px',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            padding: '3px 10px', borderRadius: '9999px',
            background: 'rgba(202,138,4,0.12)', color: 'var(--gold)',
          }}>
            Live Now
          </span>
          <span style={{
            display: 'inline-block', fontFamily: 'var(--font-dm-mono)', fontSize: '8px',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            padding: '3px 10px', borderRadius: '9999px',
            background: 'rgba(245,237,224,0.06)', color: 'var(--cream-dim)',
          }}>
            Drawn
          </span>
          <span style={{
            display: 'inline-block', fontFamily: 'var(--font-dm-mono)', fontSize: '8px',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            padding: '3px 10px', borderRadius: '9999px',
            background: 'rgba(194,65,12,0.12)', color: 'var(--signal)',
          }}>
            2 Spots Left
          </span>
        </div>
      </section>

      {/* Live Example — Drop Card */}
      <section style={{ marginBottom: '96px' }}>
        <SectionLabel>In Context — Drop Card</SectionLabel>
        <p style={{ fontFamily: 'var(--font-jost)', fontSize: '13px', color: 'var(--cream-dim)', marginBottom: '32px' }}>
          How the system applies to a real component.
        </p>

        {/* Drop cards — side by side comparison */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

        {/* Card A — Jost 700 */}
        <div style={{ border: '1px solid var(--walnut-mid)', width: '400px' }}>
          <div style={{ padding: '6px 16px', background: 'var(--walnut-mid)' }}>
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--cream-dim)' }}>Option A — Jost 700</p>
          </div>
          <div style={{ padding: '28px' }}>
            <h2 style={{ fontFamily: 'var(--font-jost)', fontSize: '24px', fontWeight: 700, color: 'var(--cream)', marginBottom: '8px', letterSpacing: '0' }}>
              Nike Dunk Low Panda
            </h2>
            <p style={{ fontFamily: 'var(--font-jost)', fontSize: '14px', color: 'var(--cream-dim)', lineHeight: 1.6, marginBottom: '20px' }}>
              Deadstock. Sourced retail. In hand.
            </p>
            <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
              <StatBlock label="Entry" value="$5" />
              <StatBlock label="Market Value" value="$180" />
              <StatBlock label="Draw" value="Apr 19" />
            </div>
          </div>
        </div>

        {/* Card B — Barlow Condensed · LOCKED */}
        <div style={{ border: '1px solid rgba(202,138,4,0.3)', width: '400px' }}>
          <div style={{ padding: '6px 16px', background: 'rgba(202,138,4,0.08)' }}>
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>Barlow Condensed 700 · LOCKED</p>
          </div>
          <div style={{ padding: '28px' }}>
            <h2 style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '28px', fontWeight: 700, color: 'var(--cream)', marginBottom: '12px', letterSpacing: '0.01em', textTransform: 'uppercase' }}>
              Nike Dunk Low Panda
            </h2>
            <p style={{ fontFamily: 'var(--font-jost)', fontStyle: 'italic', fontSize: '13px', color: 'rgba(245,237,224,0.4)', lineHeight: 1.6, marginBottom: '4px' }}>
              "The Dunk was always a canvas — it just needed the right artists."
            </p>
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(245,237,224,0.2)', marginBottom: '20px' }}>
              — Peter Moore, original Dunk designer, 1985
            </p>
            <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
              <StatBlock label="Entry" value="$5" />
              <StatBlock label="Market Value" value="$180" />
              <StatBlock label="Draw" value="Apr 19" />
            </div>
          </div>
        </div>

        </div>

        {/* original full card kept below for reference */}
        <div style={{ border: '1px solid var(--walnut-mid)', maxWidth: '540px', marginTop: '32px' }}>
          {/* Image zone */}
          <div style={{
            width: '100%', aspectRatio: '16/9',
            background: 'var(--walnut)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,237,224,0.15)' }}>
              Drop Image
            </p>
            {/* Live badge */}
            <span style={{
              position: 'absolute', top: '16px', left: '16px',
              fontFamily: 'var(--font-dm-mono)', fontSize: '8px',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              padding: '3px 10px', borderRadius: '9999px',
              background: 'rgba(202,138,4,0.12)', color: 'var(--gold)',
            }}>
              Live Now
            </span>
          </div>

          {/* Content */}
          <div style={{ padding: '40px' }}>
            <h2 style={{
              fontFamily: 'var(--font-barlow-condensed)', fontSize: '28px', fontWeight: 700,
              color: 'var(--cream)', marginBottom: '12px', letterSpacing: '0.01em', textTransform: 'uppercase',
            }}>
              Nike Dunk Low Panda
            </h2>
            <p style={{ fontFamily: 'var(--font-jost)', fontStyle: 'italic', fontSize: '13px', color: 'rgba(245,237,224,0.4)', lineHeight: 1.6, marginBottom: '4px' }}>
              "The Dunk was always a canvas — it just needed the right artists."
            </p>
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(245,237,224,0.2)', marginBottom: '28px' }}>
              — Peter Moore, original Dunk designer, 1985
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', flexWrap: 'wrap' }}>
              <StatBlock label="Entry" value="$5" />
              <StatBlock label="Market Value" value="$180" />
              <StatBlock label="Draw" value="Apr 19" />
              <StatBlock label="Odds" value="1 in 100" highlight />
            </div>

            {/* Ticket number example */}
            <div style={{ marginBottom: '24px', padding: '12px 16px', background: 'var(--walnut-mid)', borderLeft: '2px solid var(--gold)' }}>
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--cream-dim)', marginBottom: '4px' }}>
                Your Ticket
              </p>
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '20px', fontWeight: 500, color: 'var(--cream)' }}>
                #0247
              </p>
            </div>

            <button style={{
              width: '100%',
              background: 'var(--gold)', color: 'var(--bg)',
              fontFamily: 'var(--font-jost)', fontWeight: 600, fontSize: '13px',
              textTransform: 'uppercase', letterSpacing: '0.15em',
              padding: '16px 32px', borderRadius: '2px', border: 'none', cursor: 'pointer',
            }}>
              Enter the Drop
            </button>
          </div>
        </div>
      </section>

      {/* Motion Reference */}
      <section style={{ marginBottom: '96px' }}>
        <SectionLabel>Motion System</SectionLabel>
        <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <InfoCard label="Hover" value="150ms ease-out" sub="Color, opacity, border transitions." />
          <InfoCard label="Entrance" value="500ms cubic-bezier(0.16, 1, 0.3, 1)" sub="Elements appearing on load or scroll." />
          <InfoCard label="Page" value="400ms cubic-bezier(0.25, 0.1, 0.25, 1)" sub="Page-level transitions." />
          <InfoCard label="Draw Reveal" value="600ms cubic-bezier(0.34, 1.56, 0.64, 1)" sub="Spring. Ticket number only. One element. One spring. Never more." />
          <InfoCard label="Beacon Pulse" value="2.5s ease-in-out infinite" sub="Room hotspots. Max scale 1.10. Breath, not alarm." />
          <InfoCard label="Stagger" value="60ms per word" sub="Text reveals. ease-out per word, offset sequentially." />
        </div>
      </section>

      {/* Shape Language */}
      <section style={{ marginBottom: '96px' }}>
        <SectionLabel>Shape Language</SectionLabel>
        <div style={{ marginTop: '32px', display: 'flex', gap: '24px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--cream-dim)', marginBottom: '12px' }}>
              0px — Containers, Cards, Images
            </p>
            <div style={{ width: '120px', height: '80px', border: '1px solid var(--walnut-mid)', borderRadius: '0px', background: 'var(--walnut)' }} />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--cream-dim)', marginBottom: '12px' }}>
              2px — Buttons, Inputs
            </p>
            <div style={{ width: '120px', height: '48px', border: '1px solid var(--gold)', borderRadius: '2px', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-jost)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--bg)' }}>Enter</span>
            </div>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--cream-dim)', marginBottom: '12px' }}>
              Pill — Badges Only
            </p>
            <span style={{
              display: 'inline-block', fontFamily: 'var(--font-dm-mono)', fontSize: '8px',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              padding: '4px 12px', borderRadius: '9999px',
              background: 'rgba(202,138,4,0.12)', color: 'var(--gold)',
            }}>
              Live Now
            </span>
          </div>
        </div>
      </section>

      {/* Psychology Reference */}
      <section style={{ marginBottom: '96px' }}>
        <SectionLabel>Psychological Framework</SectionLabel>
        <p style={{ fontFamily: 'var(--font-jost)', fontSize: '13px', color: 'var(--cream-dim)', marginBottom: '32px', maxWidth: '600px', lineHeight: 1.6 }}>
          Every structural decision maps to a behavioral science mechanism. This is not marketing language.
          Full citations in BRANDING.md Section 15.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          {[
            { mechanism: 'Reactance', ref: 'Brehm, 1966', note: '"One winner" eliminates access entirely — maximally activates desire to enter.' },
            { mechanism: 'Anticipatory Pleasure', ref: 'Loewenstein, 1987', note: 'The wait is the product. Every touchpoint between entry and draw is a dopamine event.' },
            { mechanism: 'Variable Ratio', ref: 'Skinner & Ferster, 1957', note: 'Any entry could win. The brain cannot habituate. Highest re-engagement rate of any schedule.' },
            { mechanism: 'Signal Value', ref: 'Identity theory', note: 'Entering signals group membership. The ticket is a credential, not a receipt.' },
            { mechanism: 'FOMO', ref: 'Social loss framing', note: 'Not "I missed it." It\'s "I watched someone else get it." The public winner drives re-entry.' },
            { mechanism: 'Scarcity + Proof', ref: 'Cialdini, 1984', note: 'Showing "847 entries" + "one winner" simultaneously compounds desire.' },
          ].map(m => (
            <div key={m.mechanism} style={{ padding: '20px', border: '1px solid var(--walnut-mid)', background: 'var(--walnut)' }}>
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>
                {m.mechanism}
              </p>
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--cream-dim)', marginBottom: '10px' }}>
                {m.ref}
              </p>
              <p style={{ fontFamily: 'var(--font-jost)', fontSize: '12px', color: 'var(--cream-dim)', lineHeight: 1.5 }}>
                {m.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--walnut-mid)', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--cream-dim)' }}>
          DEDSTOK Brand System v1.0 — April 2026
        </p>
        <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--signal)' }}>
          Internal — Remove Before Launch
        </p>
      </div>

    </main>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '8px' }}>
      <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', whiteSpace: 'nowrap' }}>
        {children}
      </p>
      <div style={{ flex: 1, height: '1px', background: 'var(--walnut-mid)' }} />
    </div>
  )
}

function StatBlock({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div>
      <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--cream-dim)', marginBottom: '4px' }}>
        {label}
      </p>
      <p style={{ fontFamily: highlight ? 'var(--font-bebas)' : 'var(--font-jost)', fontSize: highlight ? '20px' : '16px', fontWeight: 700, color: highlight ? 'var(--gold)' : 'var(--cream)' }}>
        {value}
      </p>
    </div>
  )
}

function InfoCard({ label, value, sub }: { label: string, value: string, sub: string }) {
  return (
    <div style={{ padding: '20px 24px', border: '1px solid var(--walnut-mid)', background: 'var(--walnut)' }}>
      <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '6px' }}>
        {label}
      </p>
      <p style={{ fontFamily: 'var(--font-jost)', fontSize: '15px', fontWeight: 600, color: 'var(--cream)', marginBottom: '6px' }}>
        {value}
      </p>
      <p style={{ fontFamily: 'var(--font-jost)', fontSize: '12px', color: 'var(--cream-dim)', lineHeight: 1.5 }}>
        {sub}
      </p>
    </div>
  )
}
