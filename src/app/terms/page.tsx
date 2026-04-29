import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'DEDSTOK Terms of Service. Read before participating in any drop.',
}

const SECTIONS = [
  {
    id: 'about',
    n: '01',
    title: 'About DEDSTOK',
    content: [
      'DEDSTOK ("we", "us", "our") is a weekly streetwear prize competition operated from Lebanon. Each week, we source one item from the secondary market, hold it, and run a skill-based competition where the winner receives the item.',
      'By accessing dedstok.xyz or creating an account, you agree to these Terms of Service in full. If you do not agree, do not use the service.',
      'These terms were last updated in April 2026.',
    ],
  },
  {
    id: 'eligibility',
    n: '02',
    title: 'Eligibility',
    content: [
      'You must be at least 18 years old to create an account or enter any drop.',
      'You must provide accurate personal information including your real name, a valid email address, and a verified phone number.',
      'One account per person. DEDSTOK uses phone number verification to enforce this. Creating multiple accounts to gain additional entries is a violation of these terms and will result in permanent account suspension.',
      'A purchase is not required to participate in any drop. A skill-based free entry alternative is available. See the Raffle Rules for how to participate at no cost.',
    ],
  },
  {
    id: 'account',
    n: '03',
    title: 'Account Registration',
    content: [
      'You are responsible for maintaining the confidentiality of your account credentials. You are responsible for all activity under your account.',
      'You must notify us immediately of any unauthorized use of your account at support@dedstok.xyz.',
      'We may suspend or terminate your account at any time if we determine you have violated these terms, provided false information, or attempted to manipulate the platform.',
      'You may delete your account at any time from the account page. Deletion removes your personal data subject to our retention obligations.',
    ],
  },
  {
    id: 'entry',
    n: '04',
    title: 'Entry and Payment',
    content: [
      'Entry into a drop requires purchasing one or more spots via Stripe. The price per spot is set per drop and displayed clearly before purchase.',
      'Maximum 2 spots per person per drop. This limit is enforced at the database level and cannot be circumvented.',
      'All charges are final and non-refundable, except in the event of a drop cancellation by DEDSTOK, in which case a full refund is issued within 5 business days.',
      'DEDSTOK does not store payment card information. All payment processing is handled by Stripe, Inc. and subject to their terms.',
      'By submitting a payment, you confirm that you are authorized to use the payment method provided.',
    ],
  },
  {
    id: 'tickets',
    n: '05',
    title: 'Ticket Assignment',
    content: [
      'Each spot purchased is assigned a unique, sequential ticket number at the moment of purchase.',
      'Ticket assignment is atomic — two purchases cannot receive the same number.',
      'Your ticket numbers are viewable in your account and included in your purchase confirmation.',
      'Ticket numbers cannot be transferred, sold, or gifted to another account.',
    ],
  },
  {
    id: 'draw',
    n: '06',
    title: 'Draw and Winner Selection',
    content: [
      'The winner is selected by a cryptographically secure random algorithm (Node.js crypto.randomInt). The draw is not influenced by any human decision.',
      'The result is sealed immediately with a SHA-256 verification hash that is published and permanently stored. This hash allows independent verification that the result was not altered post-draw.',
      'The draw result is final. DEDSTOK does not accept appeals or requests for re-draws except in the event of a documented system failure.',
      'Any verified system failure that affects the integrity of a draw will result in a full void and re-draw, with written notice to all entrants.',
      'Draw results and verification data are publicly accessible at dedstok.xyz/winners.',
    ],
  },
  {
    id: 'prizes',
    n: '07',
    title: 'Prizes',
    content: [
      'All items listed in a drop are authentic and in DEDSTOK\'s possession before the drop is announced. We do not pre-sell or source after announcement.',
      'Items are deadstock and in original condition unless otherwise stated on the drop page.',
      'The winner must confirm receipt details within 48 hours of notification. Failure to respond within 48 hours constitutes forfeiture, and a re-draw will be conducted.',
      'Shipping within Lebanon is arranged and covered by DEDSTOK. The winner is responsible for any customs duties or import taxes on international shipments.',
      'Prizes cannot be exchanged, returned, or redeemed for cash.',
    ],
  },
  {
    id: 'ip',
    n: '08',
    title: 'Intellectual Property',
    content: [
      'All content on dedstok.xyz — including the DEDSTOK name, DS logo mark, design system, and written content — is owned by DEDSTOK and may not be reproduced without written permission.',
      'By submitting content to DEDSTOK (such as a creator application or contest entry), you grant us a non-exclusive, royalty-free license to use that content in connection with the service.',
    ],
  },
  {
    id: 'liability',
    n: '09',
    title: 'Limitation of Liability',
    content: [
      'DEDSTOK is provided "as is." We make no guarantees that the service will be uninterrupted, error-free, or available at all times.',
      'To the maximum extent permitted by law, DEDSTOK and its operators are not liable for any indirect, incidental, consequential, or punitive damages arising from your use of the service.',
      'Our total liability for any claim arising from these terms or use of the service shall not exceed the amount you paid in entry fees for the specific drop in question.',
      'Nothing in these terms limits liability for fraud, gross negligence, or any liability that cannot be excluded by law.',
    ],
  },
  {
    id: 'changes',
    n: '10',
    title: 'Changes to These Terms',
    content: [
      'We may update these terms from time to time. Material changes will be communicated via email to registered accounts or via a notice on the site.',
      'Continued use of the service after changes constitutes acceptance of the revised terms.',
      'The version of the terms in effect when a drop opens governs that drop.',
    ],
  },
  {
    id: 'law',
    n: '11',
    title: 'Governing Law',
    content: [
      'These terms are governed by the laws of Lebanon. Any disputes shall be subject to the exclusive jurisdiction of Lebanese courts.',
      'DEDSTOK makes no representation that the service is appropriate or available in all jurisdictions. You access the service at your own risk and are responsible for compliance with local laws.',
    ],
  },
  {
    id: 'contact',
    n: '12',
    title: 'Contact',
    content: [
      'For any questions regarding these terms, contact us at support@dedstok.xyz.',
      'Response time: within 3 business days.',
    ],
  },
]

export default function TermsPage() {
  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .terms-nav { display: none; }
        }
      `}</style>
      <main style={{ minHeight: '100vh', maxWidth: '960px', margin: '0 auto', padding: 'clamp(32px, 5vw, 56px) clamp(20px, 5vw, 32px) 120px' }}>

        {/* Header */}
        <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px', display: 'block' }}>
          Legal
        </span>
        <h1 style={{ fontFamily: 'var(--font-anton)', fontSize: 'clamp(48px, 8vw, 80px)', letterSpacing: '0.02em', lineHeight: 1, color: 'var(--cream)', marginBottom: '20px' }}>
          TERMS OF<br />SERVICE.
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.1em', color: 'rgba(245,237,224,0.2)', marginBottom: '64px' }}>
          Last updated: April 2026
        </p>

        <div style={{ display: 'flex', gap: '56px', alignItems: 'flex-start' }}>

          {/* Sticky nav — desktop */}
          <nav className="terms-nav" style={{ flexShrink: 0, width: '160px', position: 'sticky', top: '88px' }}>
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
                { label: 'Raffle Rules', href: '/rules' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'FAQ', href: '/faq' },
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
