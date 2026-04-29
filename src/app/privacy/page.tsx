import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How DEDSTOK collects, uses, and protects your data.',
}

const SECTIONS = [
  {
    id: 'collect',
    n: '01',
    title: 'What We Collect',
    content: [
      'Account data: Username, email address, phone number. Required to participate.',
      'Entry data: Drop ID, spots purchased, ticket numbers assigned, payment reference (not card data — see Section 03).',
      'Usage data: Pages visited, actions taken, timestamps. Used to operate the platform and detect abuse.',
      'Communications: Any messages you send to support@dedstok.xyz are retained for support purposes.',
      'We do not collect: facial data, government ID, financial account numbers, or any data beyond what is strictly necessary to run the service.',
    ],
  },
  {
    id: 'use',
    n: '02',
    title: 'How We Use Your Data',
    content: [
      'To operate the service: authenticate you, process entries, assign tickets, and run draws.',
      'To notify you: confirm entries, announce draw results, and send winner notifications via email and SMS.',
      'To maintain the leaderboard and referral/creator systems.',
      'To detect and prevent fraud, duplicate accounts, and manipulation.',
      'We do not sell your data. We do not use your data for advertising.',
    ],
  },
  {
    id: 'third-parties',
    n: '03',
    title: 'Third-Party Services',
    content: [
      'Stripe (stripe.com) — Payment processing. We pass your payment to Stripe. We do not see, store, or process your card number. Subject to Stripe\'s Privacy Policy.',
      'Supabase (supabase.com) — Database and authentication. Your account data, entries, and points are stored in Supabase. Subject to Supabase\'s Privacy Policy.',
      'Resend (resend.com) — Transactional email. Used to send entry confirmations, winner notifications, and account emails.',
      'Twilio (twilio.com) — SMS delivery. Used to send OTP codes and winner SMS notifications. Your phone number is shared with Twilio for this purpose.',
      'Vercel (vercel.com) — Hosting and infrastructure. Your requests are served through Vercel\'s network.',
      'We only share data with these services to the minimum extent necessary to operate DEDSTOK.',
    ],
  },
  {
    id: 'cookies',
    n: '04',
    title: 'Cookies and Storage',
    content: [
      'We use session cookies to keep you logged in. These are essential for the service to function.',
      'We do not use advertising cookies or third-party tracking pixels.',
      'Authentication state is managed via Supabase\'s cookie-based session system.',
      'You can clear cookies at any time by signing out or clearing your browser storage. This will log you out.',
    ],
  },
  {
    id: 'retention',
    n: '05',
    title: 'Data Retention',
    content: [
      'Your account data is retained for as long as your account is active.',
      'Entry and draw data (ticket numbers, verification hashes) is retained indefinitely as part of the permanent draw record.',
      'If you delete your account, your personal data (email, phone, username) is removed. Entry data is anonymized, not deleted, as it is part of the public draw verification record.',
      'Support communications are retained for 24 months.',
    ],
  },
  {
    id: 'rights',
    n: '06',
    title: 'Your Rights',
    content: [
      'Access: You can view your account data, entry history, and points in your account page at any time.',
      'Deletion: You can delete your account directly from your account page. This removes your personal data permanently.',
      'Correction: Contact support@dedstok.xyz to correct inaccurate data.',
      'Data portability: Contact us to request an export of your personal data.',
      'Withdrawal of consent: You may opt out of SMS notifications by contacting support. Note that some transactional SMS (e.g. OTP codes) are required to use the service.',
    ],
  },
  {
    id: 'security',
    n: '07',
    title: 'Security',
    content: [
      'All data is transmitted over HTTPS. We do not operate unencrypted endpoints.',
      'Authentication tokens are stored in secure, httpOnly cookies.',
      'Passwords are never stored in plaintext. Authentication is handled by Supabase Auth.',
      'Access to production databases is restricted to the application layer. No direct public database access.',
      'No security system is perfect. If you discover a vulnerability, contact support@dedstok.xyz immediately.',
    ],
  },
  {
    id: 'changes',
    n: '08',
    title: 'Changes to This Policy',
    content: [
      'We may update this policy as the service evolves. Material changes will be communicated via email.',
      'The date at the top of this page reflects the most recent update.',
      'Continued use of the service after a policy update constitutes acceptance.',
    ],
  },
  {
    id: 'contact',
    n: '09',
    title: 'Contact',
    content: [
      'For any privacy questions, data requests, or concerns: support@dedstok.xyz.',
      'We aim to respond within 3 business days.',
      'DEDSTOK operates from Beirut, Lebanon.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .privacy-nav { display: none; }
        }
      `}</style>
      <main style={{ minHeight: '100vh', maxWidth: '960px', margin: '0 auto', padding: 'clamp(32px, 5vw, 56px) clamp(20px, 5vw, 32px) 120px' }}>

        {/* Header */}
        <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px', display: 'block' }}>
          Legal
        </span>
        <h1 style={{ fontFamily: 'var(--font-anton)', fontSize: 'clamp(48px, 8vw, 80px)', letterSpacing: '0.02em', lineHeight: 1, color: 'var(--cream)', marginBottom: '20px' }}>
          PRIVACY<br />POLICY.
        </h1>
        <p style={{ fontFamily: 'var(--font-jost)', fontWeight: 300, fontSize: '13px', color: 'var(--cream-dim)', marginBottom: '8px', lineHeight: 1.7, maxWidth: '480px' }}>
          We collect what we need to run the service. Nothing more. This document explains exactly what that is, who sees it, and how long we keep it.
        </p>
        <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.1em', color: 'rgba(245,237,224,0.2)', marginBottom: '64px' }}>
          Last updated: April 2026
        </p>

        <div style={{ display: 'flex', gap: '56px', alignItems: 'flex-start' }}>

          {/* Sticky nav — desktop */}
          <nav className="privacy-nav" style={{ flexShrink: 0, width: '160px', position: 'sticky', top: '88px' }}>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-jost)',
                  fontWeight: 300,
                  fontSize: '11px',
                  color: 'rgba(245,237,224,0.35)',
                  textDecoration: 'none',
                  padding: '6px 0 6px 14px',
                  borderLeft: '1px solid rgba(245,237,224,0.07)',
                  lineHeight: 1.5,
                  transition: 'color 150ms',
                }}
              >
                {s.n} {s.title}
              </a>
            ))}
          </nav>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id} style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'rgba(202,138,4,0.45)', paddingTop: '4px', flexShrink: 0 }}>
                    {section.n}
                  </span>
                  <h2 style={{ fontFamily: 'var(--font-jost)', fontWeight: 500, fontSize: '15px', letterSpacing: '0.02em', color: 'var(--cream)', lineHeight: 1.3 }}>
                    {section.title}
                  </h2>
                </div>
                <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {section.content.map((para, i) => (
                    <p key={i} style={{ fontFamily: 'var(--font-jost)', fontWeight: 300, fontSize: '13px', lineHeight: 1.8, color: 'var(--cream-dim)' }}>
                      {para}
                    </p>
                  ))}
                </div>
                <div style={{ height: '1px', background: 'rgba(245,237,224,0.06)', marginTop: '36px' }} />
              </section>
            ))}

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', paddingTop: '8px' }}>
              {[
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Raffle Rules', href: '/rules' },
                { label: 'Delete My Account', href: '/account' },
              ].map((link) => (
                <Link key={link.href} href={link.href} style={{ fontFamily: 'var(--font-jost)', fontWeight: 300, fontSize: '12px', color: 'rgba(245,237,224,0.3)', textDecoration: 'none' }}>
                  {link.label} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
