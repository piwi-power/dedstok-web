import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const colLabel: React.CSSProperties = {
    fontFamily: 'var(--font-dm-mono)',
    fontSize: '8px',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'var(--gold)',
    marginBottom: '20px',
    display: 'block',
    opacity: 0.7,
  }

  const linkStyle: React.CSSProperties = {
    fontFamily: 'var(--font-jost)',
    fontWeight: 300,
    fontSize: '12px',
    letterSpacing: '0.04em',
    color: 'rgba(245,237,224,0.55)',
    textDecoration: 'none',
    display: 'block',
    lineHeight: 1,
  }

  return (
    <footer style={{ background: 'var(--bg)', padding: '0 clamp(20px,4vw,48px)' }}>

      {/* Gradient separator */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(202,138,4,0.4) 20%, rgba(202,138,4,0.4) 80%, transparent 100%)' }} />

      {/* How it works */}
      <div style={{
        maxWidth: '960px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        padding: '64px 0 56px',
        borderBottom: '1px solid rgba(245,237,224,0.06)',
        gap: '0',
      }}
        className="footer-how"
      >
        {[
          {
            n: '01',
            title: 'We source a grail.',
            body: 'One item per week. Curated from the secondary market. In hand before it\'s announced. You never know what\'s next.',
          },
          {
            n: '02',
            title: 'Enter your name.',
            body: 'Flat fee per entry. Max 2 per drop. No algorithm, no follow-to-win. Just you and the odds.',
          },
          {
            n: '03',
            title: 'One winner. Drawn publicly.',
            body: 'Cryptographic draw, publicly verifiable. Every ticket number is real. Ships direct. No tricks, no favorites.',
          },
        ].map((step) => (
          <div key={step.n} style={{ paddingRight: '48px' }}>
            <span style={{ fontFamily: 'var(--font-anton)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: '18px', display: 'block' }}>
              {step.n}
            </span>
            <p style={{ fontFamily: 'var(--font-jost)', fontWeight: 400, fontSize: '13px', color: 'var(--cream)', marginBottom: '10px', lineHeight: 1.4 }}>
              {step.title}
            </p>
            <p style={{ fontFamily: 'var(--font-jost)', fontWeight: 300, fontSize: '12px', color: 'rgba(245,237,224,0.4)', lineHeight: 1.75 }}>
              {step.body}
            </p>
          </div>
        ))}
      </div>

      {/* Brand + nav columns */}
      <div style={{
        maxWidth: '960px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
        padding: '56px 0 48px',
        borderBottom: '1px solid rgba(245,237,224,0.06)',
        alignItems: 'start',
        gap: '0',
      }}
        className="footer-main"
      >
        {/* Brand lockup */}
        <div style={{ paddingRight: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Image
              src="/ds-logo-black-transparent.png"
              alt="DS"
              width={26}
              height={29}
              style={{ filter: 'brightness(0) invert(1)', opacity: 0.88 }}
            />
            <span style={{ fontFamily: 'var(--font-anton)', fontSize: '21px', letterSpacing: '0.14em', color: 'var(--cream)', lineHeight: 1 }}>
              DEDSTOK
            </span>
          </div>
          <p style={{
            fontFamily: 'var(--font-jost)',
            fontWeight: 300,
            fontSize: '9px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(245,237,224,0.4)',
            lineHeight: 1.9,
            textAlign: 'center',
          }}>
            One drop.<br />One winner.<br />Every week.
          </p>
        </div>

        {/* Navigate */}
        <div>
          <span style={colLabel}>Navigate</span>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '13px' }}>
            {[
              { label: 'Current Drop', href: '/drops' },
              { label: 'Archive', href: '/drops/archive' },
              { label: 'Winners', href: '/winners' },
              { label: 'Leaderboard', href: '/leaderboard' },
              { label: 'FAQ', href: '/faq' },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} style={linkStyle}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Connect */}
        <div>
          <span style={colLabel}>Connect</span>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '13px' }}>
            <li>
              <a
                href="https://www.instagram.com/dedstokdedstok"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                @dedstokdedstok ↗
              </a>
            </li>
            <li>
              <Link
                href="/creator"
                style={{ ...linkStyle, color: 'rgba(202,138,4,0.65)', fontSize: '11px' }}
              >
                Apply to become a creator →
              </Link>
            </li>
            <li>
              <a href="mailto:support@dedstok.xyz" style={linkStyle}>
                support@dedstok.xyz
              </a>
            </li>
            <li>
              <Link href="/links" style={linkStyle}>All Links</Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <span style={colLabel}>Legal</span>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '13px' }}>
            {[
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Raffle Rules', href: '/rules' },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} style={linkStyle}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Copyright bar */}
      <div style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '20px 0 36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.08em', color: 'rgba(245,237,224,0.35)' }}>
          © 2026 DEDSTOK. All rights reserved.
        </span>
        <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.1em', color: 'var(--gold)', opacity: 0.6, textTransform: 'uppercase' }}>
          Beirut, Lebanon
        </span>
      </div>

    </footer>
  )
}
