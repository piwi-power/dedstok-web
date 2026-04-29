import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Become a Creator',
  description: 'Apply to join the DEDSTOK creator program. Get your own code, earn on every entry.',
}

const WHAT_YOU_GET = [
  {
    label: 'Your Code',
    body: 'A unique code tied to your identity. Your followers enter it at checkout. You earn every time they do.',
  },
  {
    label: 'Points on Every Entry',
    body: 'Each time someone uses your code to enter a drop, you earn points credited to your account. No cap per drop.',
  },
  {
    label: 'Creator Panel',
    body: 'Your account page shows total code uses, points earned, and a breakdown by drop. Full visibility, always.',
  },
  {
    label: 'Your Community Benefits',
    body: 'Followers who use your code get a benefit at checkout. You earn. They get something. Everyone wins.',
  },
]

export default function CreatorPage() {
  const s = {
    label: {
      fontFamily: 'var(--font-dm-mono)',
      fontSize: '9px',
      letterSpacing: '0.3em',
      textTransform: 'uppercase' as const,
      color: 'var(--gold)',
      marginBottom: '12px',
      display: 'block',
    },
    h1: {
      fontFamily: 'var(--font-anton)',
      fontSize: 'clamp(48px, 8vw, 80px)',
      letterSpacing: '0.02em',
      lineHeight: 1,
      color: 'var(--cream)',
      marginBottom: '20px',
    },
    lead: {
      fontFamily: 'var(--font-jost)',
      fontWeight: 300,
      fontSize: '15px',
      lineHeight: 1.75,
      color: 'var(--cream-dim)',
      maxWidth: '520px',
      marginBottom: '64px',
    },
    sectionTitle: {
      fontFamily: 'var(--font-jost)',
      fontWeight: 500,
      fontSize: '11px',
      letterSpacing: '0.14em',
      textTransform: 'uppercase' as const,
      color: 'var(--cream)',
      marginBottom: '32px',
    },
  }

  return (
    <main style={{ minHeight: '100vh', padding: 'clamp(32px, 5vw, 64px) clamp(20px, 5vw, 48px) 120px', maxWidth: '800px', margin: '0 auto' }}>

      {/* Header */}
      <span style={s.label}>Creator Program</span>
      <h1 style={s.h1}>BECOME<br />A CREATOR.</h1>
      <p style={s.lead}>
        Get a code. Share it. Earn when your community enters. DEDSTOK creators aren&apos;t influencers
        — they&apos;re part of the drop. We&apos;re not looking for follower counts. We&apos;re looking for
        people who are genuinely in the culture.
      </p>

      {/* What you get */}
      <p style={s.sectionTitle}>What you get</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2px', marginBottom: '72px' }}>
        {WHAT_YOU_GET.map((item) => (
          <div
            key={item.label}
            style={{
              padding: '28px 24px',
              background: 'var(--walnut)',
              borderTop: '1px solid rgba(202,138,4,0.2)',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-jost)',
              fontWeight: 500,
              fontSize: '13px',
              letterSpacing: '0.04em',
              color: 'var(--cream)',
              marginBottom: '10px',
            }}>
              {item.label}
            </p>
            <p style={{
              fontFamily: 'var(--font-jost)',
              fontWeight: 300,
              fontSize: '12px',
              lineHeight: 1.75,
              color: 'var(--cream-dim)',
            }}>
              {item.body}
            </p>
          </div>
        ))}
      </div>

      {/* Who we want */}
      <div style={{ borderLeft: '2px solid rgba(202,138,4,0.3)', paddingLeft: '24px', marginBottom: '72px' }}>
        <p style={{ fontFamily: 'var(--font-jost)', fontWeight: 300, fontSize: '14px', lineHeight: 1.8, color: 'rgba(245,237,224,0.65)', maxWidth: '480px' }}>
          We prioritize creators who are genuinely embedded in sneaker culture — collectors, resellers, stylists,
          community builders, content makers. Follower count matters less than authenticity and audience fit.
        </p>
      </div>

      {/* Application */}
      <p style={s.sectionTitle}>Apply</p>
      <p style={{ fontFamily: 'var(--font-jost)', fontWeight: 300, fontSize: '13px', color: 'var(--cream-dim)', marginBottom: '28px', lineHeight: 1.7 }}>
        Send us a message at{' '}
        <a
          href="mailto:support@dedstok.xyz?subject=Creator%20Application&body=Name%3A%20%0AInstagram%3A%20%0ATikTok%3A%20%0AFollowers%20(approx.)%3A%20%0AWhy%20DEDSTOK%3A%20"
          style={{ color: 'var(--gold)', textDecoration: 'none' }}
        >
          support@dedstok.xyz
        </a>{' '}
        with the subject line <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: 'var(--cream)' }}>Creator Application</span>.
        Include your Instagram, TikTok, approximate audience size, and a sentence on why you want in.
        We review every application and respond within a week.
      </p>

      <a
        href="mailto:support@dedstok.xyz?subject=Creator%20Application&body=Name%3A%20%0AInstagram%3A%20%0ATikTok%3A%20%0AFollowers%20(approx.)%3A%20%0AWhy%20DEDSTOK%3A%20"
        style={{
          display: 'inline-block',
          padding: '16px 40px',
          background: 'var(--gold)',
          color: '#000',
          fontFamily: 'var(--font-jost)',
          fontWeight: 500,
          fontSize: '11px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          marginBottom: '48px',
        }}
      >
        Apply via Email →
      </a>

      <div style={{ borderTop: '1px solid rgba(245,237,224,0.06)', paddingTop: '24px' }}>
        <p style={{ fontFamily: 'var(--font-jost)', fontWeight: 300, fontSize: '12px', color: 'rgba(245,237,224,0.3)', lineHeight: 1.7 }}>
          Already a creator?{' '}
          <Link href="/account" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
            Go to your account
          </Link>{' '}
          to see your code and earnings.
        </p>
      </div>

    </main>
  )
}
