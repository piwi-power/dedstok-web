import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Raffle Rules',
  description: 'DEDSTOK raffle rules. How to enter, how tickets work, how winners are drawn.',
}

const RULES = [
  {
    n: '01',
    title: 'Eligibility',
    body: [
      'You must be 18 years of age or older to enter any drop.',
      'One account per person. Phone number verification is required. Duplicate accounts are grounds for immediate disqualification and ban.',
      'A purchase is not required to participate. A skill-based free entry alternative is available for every drop — see Rule 06.',
      'DEDSTOK reserves the right to refuse entry at its discretion.',
    ],
  },
  {
    n: '02',
    title: 'How to Enter',
    body: [
      'Entries open when a drop is revealed (Sunday).',
      'Entries close Saturday at midnight, Lebanon time (GMT+3), before the draw.',
      'To enter, create an account, verify your phone number, and purchase entry on the live drop page.',
      'Maximum 2 entries per person per drop. This limit is enforced at the account level and cannot be circumvented.',
    ],
  },
  {
    n: '03',
    title: 'Entry Fees',
    body: [
      'The entry fee is set per drop and displayed on the drop page before purchase.',
      'Payment is processed via Stripe. All major credit and debit cards accepted.',
      'All fees are final and non-refundable, except as stated in Rule 10 (Cancellations).',
      'DEDSTOK does not store card data. Payment handling is fully delegated to Stripe.',
    ],
  },
  {
    n: '04',
    title: 'Ticket Assignment',
    body: [
      'Each entry purchase is assigned one or more sequential ticket numbers, depending on spots purchased.',
      'Ticket numbers are assigned atomically at the moment of purchase — no duplicates, no gaps.',
      'Your ticket number(s) are visible in your account page after purchase and in your confirmation email.',
      'Ticket numbers are permanent for the lifetime of the draw.',
    ],
  },
  {
    n: '05',
    title: 'The Draw',
    body: [
      'The draw occurs on Saturday night after entries close.',
      'A cryptographically secure random number generator (Node.js crypto.randomInt) selects a winning ticket index from the pool.',
      'The draw is deterministic: the result is derived from the full entry pool in purchase order, and is not influenced by any human input.',
      'The result is sealed immediately with a SHA-256 verification hash and published permanently.',
      'The draw is publicly verifiable at dedstok.xyz/verify/[drop]. Anyone can confirm the result using the published entry data and hash.',
      'The winning selection is final. No appeals, no re-draws, except in the event of a verified system error.',
    ],
  },
  {
    n: '06',
    title: 'Free Entry Alternative (No Purchase Necessary)',
    body: [
      'DEDSTOK offers a skill-based free entry method for every drop.',
      'Free entry instructions are published on the drop page. Skill requirements vary by drop.',
      'Free entries are limited in quantity per drop. First-come, first-served.',
      'Free entries carry the same odds per ticket as paid entries. They are included in the same draw pool.',
      'The existence of a free entry route means DEDSTOK is not classified as a lottery under most jurisdictions.',
    ],
  },
  {
    n: '07',
    title: 'Winner Notification',
    body: [
      'The winner is notified via email and SMS immediately after the draw.',
      'The notification includes: winning ticket number, total ticket pool size, verification hash, and a link to verify the draw.',
      'The winner must respond within 48 hours to claim the prize. Response to support@dedstok.xyz or via the account page.',
      'If no response is received within 48 hours, the prize is forfeited and a re-draw occurs from the same entry pool.',
    ],
  },
  {
    n: '08',
    title: 'Prize & Fulfillment',
    body: [
      'All items are authentic, deadstock, and in original packaging. DEDSTOK does not ship items that are not in perfect condition.',
      'Items are authenticated before the drop goes live — not after. You are not funding a sourcing promise.',
      'Shipping within Lebanon occurs within 48 hours of winner confirmation. Tracking is provided.',
      'For international delivery (when available), the winner is responsible for any import duties, taxes, or customs fees.',
      'DEDSTOK is not responsible for delays or losses caused by courier services or customs authorities.',
    ],
  },
  {
    n: '09',
    title: 'Disqualification',
    body: [
      'Creating multiple accounts.',
      'Using fraudulent payment methods.',
      'Providing false identity information.',
      'Attempting to manipulate, reverse-engineer, or interfere with the draw system.',
      'Abusing the referral or creator code system.',
      'Any violation of these rules.',
      'Disqualified entries are removed from the draw pool. Entry fees for disqualified entries are not refunded.',
    ],
  },
  {
    n: '10',
    title: 'Changes & Cancellations',
    body: [
      'DEDSTOK reserves the right to cancel or postpone a drop due to circumstances beyond our control — including authentication failure, logistics breakdown, or force majeure.',
      'In the event of a full cancellation, all entry fees are refunded in full within 5 business days.',
      'In the event of a postponement, existing entries carry over to the rescheduled draw.',
      'Entry fees, ticket limits, or item details may change between drops but are locked once entries open.',
      'These rules may be updated. The version in effect at the time a drop opens governs that drop.',
    ],
  },
]

export default function RulesPage() {
  return (
    <main style={{ minHeight: '100vh', maxWidth: '760px', margin: '0 auto', padding: 'clamp(32px, 5vw, 56px) clamp(20px, 5vw, 32px) 120px' }}>

      {/* Header */}
      <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px', display: 'block' }}>
        Official Rules
      </span>
      <h1 style={{ fontFamily: 'var(--font-anton)', fontSize: 'clamp(48px, 8vw, 80px)', letterSpacing: '0.02em', lineHeight: 1, color: 'var(--cream)', marginBottom: '20px' }}>
        RAFFLE<br />RULES.
      </h1>
      <p style={{ fontFamily: 'var(--font-jost)', fontWeight: 300, fontSize: '13px', color: 'var(--cream-dim)', marginBottom: '8px', lineHeight: 1.7 }}>
        Plain English. No lawyer necessary. These are the complete rules governing every DEDSTOK drop.
      </p>
      <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.1em', color: 'rgba(245,237,224,0.2)', marginBottom: '64px' }}>
        Last updated: April 2026
      </p>

      {/* Rules */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {RULES.map((rule) => (
          <div
            key={rule.n}
            style={{
              display: 'grid',
              gridTemplateColumns: '48px 1fr',
              gap: '0 24px',
              padding: '32px 0',
              borderBottom: '1px solid rgba(245,237,224,0.07)',
              alignItems: 'start',
            }}
          >
            {/* Number */}
            <span style={{
              fontFamily: 'var(--font-dm-mono)',
              fontSize: '9px',
              letterSpacing: '0.12em',
              color: 'rgba(202,138,4,0.5)',
              paddingTop: '3px',
            }}>
              {rule.n}
            </span>

            {/* Content */}
            <div>
              <h2 style={{
                fontFamily: 'var(--font-jost)',
                fontWeight: 500,
                fontSize: '15px',
                letterSpacing: '0.02em',
                color: 'var(--cream)',
                marginBottom: '16px',
              }}>
                {rule.title}
              </h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {rule.body.map((point, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      fontFamily: 'var(--font-jost)',
                      fontWeight: 300,
                      fontSize: '13px',
                      lineHeight: 1.75,
                      color: 'var(--cream-dim)',
                    }}
                  >
                    <span style={{ color: 'rgba(202,138,4,0.25)', flexShrink: 0, fontSize: '10px', paddingTop: '4px' }}>—</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Footer links */}
      <div style={{ marginTop: '56px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Terms of Service', href: '/terms' },
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'FAQ', href: '/faq' },
          { label: 'Verify a Draw', href: '/winners' },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{ fontFamily: 'var(--font-jost)', fontWeight: 300, fontSize: '12px', color: 'rgba(245,237,224,0.35)', textDecoration: 'none', letterSpacing: '0.04em' }}
          >
            {link.label} →
          </Link>
        ))}
      </div>

    </main>
  )
}
