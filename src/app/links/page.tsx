import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'DEDSTOK — All Links',
  description: 'Follow DEDSTOK. One drop. One winner. Every week.',
}

const LINKS = [
  {
    label: 'Instagram',
    sub: '@dedstokdedstok',
    href: 'https://www.instagram.com/dedstokdedstok',
    icon: '↗',
  },
  {
    label: 'TikTok',
    sub: '@dedstokdedstok',
    href: 'https://www.tiktok.com/@dedstokdedstok',
    icon: '↗',
  },
  {
    label: 'Current Drop',
    sub: 'Enter this week',
    href: '/drops',
    icon: '→',
  },
  {
    label: 'Past Winners',
    sub: 'Every draw, on record',
    href: '/winners',
    icon: '→',
  },
  {
    label: 'Become a Creator',
    sub: 'Get your code',
    href: '/creator',
    icon: '→',
    accent: true,
  },
  {
    label: 'Contact',
    sub: 'support@dedstok.xyz',
    href: 'mailto:support@dedstok.xyz',
    icon: '↗',
  },
]

export default function LinksPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px 64px',
        background: 'var(--bg)',
      }}
    >
      {/* Brand lockup */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '10px',
        }}>
          <Image
            src="/ds-logo-black-transparent.png"
            alt="DS"
            width={28}
            height={31}
            style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }}
          />
          <span style={{
            fontFamily: 'var(--font-anton)',
            fontSize: '28px',
            letterSpacing: '0.14em',
            color: 'var(--cream)',
            lineHeight: 1,
          }}>
            DEDSTOK
          </span>
        </div>
        <p style={{
          fontFamily: 'var(--font-jost)',
          fontWeight: 300,
          fontSize: '10px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--cream-dim)',
        }}>
          One drop. One winner. Every week.
        </p>
      </div>

      {/* Links */}
      <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target={link.href.startsWith('http') ? '_blank' : undefined}
            rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 20px',
              border: link.accent
                ? '1px solid rgba(202,138,4,0.5)'
                : '1px solid rgba(245,237,224,0.1)',
              background: link.accent ? 'rgba(202,138,4,0.06)' : 'transparent',
              textDecoration: 'none',
              transition: 'border-color 150ms, background 150ms',
            }}
          >
            <div>
              <p style={{
                fontFamily: 'var(--font-jost)',
                fontWeight: 400,
                fontSize: '14px',
                letterSpacing: '0.04em',
                color: link.accent ? 'var(--gold)' : 'var(--cream)',
                marginBottom: '2px',
              }}>
                {link.label}
              </p>
              <p style={{
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '10px',
                letterSpacing: '0.06em',
                color: link.accent ? 'rgba(202,138,4,0.6)' : 'var(--cream-dim)',
              }}>
                {link.sub}
              </p>
            </div>
            <span style={{
              fontFamily: 'var(--font-jost)',
              fontSize: '16px',
              color: link.accent ? 'var(--gold)' : 'var(--cream-dim)',
            }}>
              {link.icon}
            </span>
          </a>
        ))}
      </div>

      {/* Footer note */}
      <p style={{
        marginTop: '48px',
        fontFamily: 'var(--font-dm-mono)',
        fontSize: '9px',
        letterSpacing: '0.12em',
        color: 'rgba(245,237,224,0.15)',
      }}>
        © 2026 DEDSTOK · Beirut, Lebanon
      </p>
    </main>
  )
}
