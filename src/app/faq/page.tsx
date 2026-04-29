import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Everything you need to know about DEDSTOK — how it works, entries, the draw, points, creator codes, and more.',
}

type FAQItem = { q: string; a: React.ReactNode }
type FAQSection = { id: string; label: string; items: FAQItem[] }

const faqData: FAQSection[] = [
  {
    id: 'how-it-works',
    label: '01 — How It Works',
    items: [
      {
        q: 'What is DEDSTOK?',
        a: 'A weekly streetwear raffle. One item per week — always a grail, always in hand before it\'s announced. Entry is cheap. The item is not. That gap is the product. One drop. One winner. Every week.',
      },
      {
        q: 'How does a drop work?',
        a: 'Every Sunday we reveal the item. You have until Saturday to buy up to 2 entries. On Saturday night, one winner is drawn cryptographically and publicly. The item ships within 48 hours of the draw.',
      },
      {
        q: 'When exactly do drops happen?',
        a: 'Reveal: Sunday. Draw: Saturday night. Every week, no exceptions. Times are Lebanon timezone.',
      },
      {
        q: 'Is the item authenticated and actually in stock?',
        a: 'Yes. Nothing gets announced that we don\'t already own. Every item is deadstock, authenticated, and in hand before the drop goes live. We don\'t pre-sell. We don\'t source after announcing.',
      },
    ],
  },
  {
    id: 'entries',
    label: '02 — Entries & Payment',
    items: [
      {
        q: 'How do I enter?',
        a: 'Create an account, verify your phone number, and navigate to the live drop. Entry requires a valid payment method. You can buy up to 2 entries per drop.',
      },
      {
        q: 'How much does it cost?',
        a: 'Entry price varies per drop. It\'s set by us and shown clearly on the drop page before you enter. Usually in the $5–$25 range depending on the item\'s market value.',
      },
      {
        q: 'Can I buy more than 2 entries?',
        a: 'No. Maximum 2 entries per person per drop. Hard limit, enforced at the account level. This keeps odds meaningfully fairer than typical raffles.',
      },
      {
        q: 'Are entries refundable?',
        a: 'No. Once purchased, entries are final and non-refundable. The one exception: if DEDSTOK cancels a drop, all entries are refunded in full. See Raffle Rules for details.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'Visa, Mastercard, and most major cards via Stripe. No crypto, no bank transfers.',
      },
    ],
  },
  {
    id: 'draw',
    label: '03 — The Draw',
    items: [
      {
        q: 'How is the winner chosen?',
        a: 'A cryptographic random number generator selects one ticket from the pool. Every ticket number is real and sequentially assigned. The result is tamper-evident — it can\'t be changed after the fact by us or anyone else.',
      },
      {
        q: 'Is DEDSTOK a lottery?',
        a: 'No. DEDSTOK is a skill-based competition. A purchase is not required to enter — see the Raffle Rules for the no-purchase route. The draw itself is cryptographic: a verifiable algorithm determines the winner publicly before the result is announced. No one, including us, can influence or change the outcome.',
      },
      {
        q: 'What happens when I win?',
        a: 'You get an email and SMS immediately after the draw. The email contains your winning ticket number, a verification hash, a link to verify the draw, and a quote from our library. Reply or contact support@dedstok.xyz to arrange shipping.',
      },
    ],
  },
  {
    id: 'shipping',
    label: '04 — Shipping & Prizes',
    items: [
      {
        q: 'Where do you ship?',
        a: 'Currently shipping within Lebanon. International shipping is coming. If you\'re outside Lebanon, check back — we\'ll announce when we expand.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Within 48 hours of the draw for Lebanon deliveries. Tracking provided. We ship direct — no third-party logistics.',
      },
      {
        q: 'What condition are the items in?',
        a: '100% deadstock. In original box. Authenticated. No exceptions. If an item isn\'t perfect, it doesn\'t drop.',
      },
    ],
  },
  {
    id: 'points',
    label: '05 — Points & Leaderboard',
    items: [
      {
        q: 'What are points?',
        a: 'Points are earned when you buy entries. They accumulate on your account and power the leaderboard. Future benefits tied to points milestones are coming.',
      },
      {
        q: 'How do I earn points?',
        a: 'You earn points with every entry you buy. Using a creator code or being referred may also earn bonus points. Specific amounts per drop are shown in your account.',
      },
      {
        q: 'What is the leaderboard?',
        a: 'Two boards run simultaneously: Hall of Records (all-time cumulative points, never resets) and Monthly (points earned minus redeemed within the calendar month). Both are public.',
      },
      {
        q: 'What does #1 on the monthly leaderboard get?',
        a: 'The previous month\'s #1 earns a 2x ticket multiplier on the next drop. Every entry you buy counts as 2 tickets. Same entry limit (2 purchases), but meaningfully higher probability of winning.',
      },
    ],
  },
  {
    id: 'creators',
    label: '06 — Creator Codes',
    items: [
      {
        q: 'What is an influencer or creator code?',
        a: 'A unique alphanumeric code assigned to approved creators. When someone enters a drop using your code, you earn points credited to your account. It\'s how we compensate creators for bringing their community in.',
      },
      {
        q: 'How do I get a code?',
        a: (
          <>
            Apply at{' '}
            <Link href="/creator" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
              dedstok.xyz/creator
            </Link>
            . We review applications and respond within a week. We don&apos;t require a minimum follower count — we care about authenticity and audience fit.
          </>
        ),
      },
      {
        q: 'Do my followers get anything when they use my code?',
        a: 'Yes. Followers who enter a drop using your creator code receive a benefit at checkout — shown on the drop page. You earn points. They get something. The benefit varies by drop.',
      },
      {
        q: 'Where can I see my creator earnings?',
        a: 'In your account page under Creator Earnings. You can see total code uses, total points earned, and a per-drop breakdown.',
      },
    ],
  },
]

export default function FAQPage() {
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
    sectionLabel: {
      fontFamily: 'var(--font-dm-mono)',
      fontSize: '9px',
      letterSpacing: '0.25em',
      textTransform: 'uppercase' as const,
      color: 'var(--gold)',
      opacity: 0.7,
      marginBottom: '4px',
      display: 'block',
    },
    question: {
      fontFamily: 'var(--font-jost)',
      fontWeight: 400,
      fontSize: '14px',
      letterSpacing: '0.02em',
      color: 'var(--cream)',
      lineHeight: 1.5,
    },
    answer: {
      fontFamily: 'var(--font-jost)',
      fontWeight: 300,
      fontSize: '13px',
      lineHeight: 1.8,
      color: 'var(--cream-dim)',
    },
  }

  return (
    <>
      <style>{`
        details summary { cursor: pointer; list-style: none; }
        details summary::-webkit-details-marker { display: none; }
        .faq-icon { transition: transform 150ms ease; display: inline-block; font-size: 18px; line-height: 1; color: rgba(245,237,224,0.3); flex-shrink: 0; }
        details[open] .faq-icon { transform: rotate(45deg); color: var(--gold); }
        .faq-answer { animation: faqIn 180ms ease-out; }
        @keyframes faqIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        details[open] summary { color: var(--cream); }
        .faq-item { border-bottom: 1px solid rgba(245,237,224,0.07); }
        .faq-item summary:hover .faq-q { color: var(--cream); }
        .eli5-toggle summary { cursor: pointer; list-style: none; }
        .eli5-toggle summary::-webkit-details-marker { display: none; }
        .eli5-icon { transition: transform 150ms ease; display: inline-block; font-size: 11px; }
        details.eli5-toggle[open] .eli5-icon { transform: rotate(180deg); }

        @media (max-width: 640px) {
          .faq-nav { display: none; }
        }
      `}</style>

      <main style={{ minHeight: '100vh', maxWidth: '900px', margin: '0 auto', padding: 'clamp(32px, 5vw, 56px) clamp(20px, 5vw, 32px) 120px' }}>

        {/* Header */}
        <span style={s.label}>FAQ</span>
        <h1 style={s.h1}>FREQUENTLY<br />ASKED.</h1>
        <p style={{ fontFamily: 'var(--font-jost)', fontWeight: 300, fontSize: '14px', color: 'var(--cream-dim)', marginBottom: '56px', lineHeight: 1.7, maxWidth: '480px' }}>
          Everything you need to know about entering, the draw, points, creator codes, and how we verify every result.
        </p>

        <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>

          {/* Sticky anchor nav — desktop only */}
          <nav className="faq-nav" style={{ flexShrink: 0, width: '180px', position: 'sticky', top: '88px' }}>
            {faqData.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-jost)',
                  fontWeight: 300,
                  fontSize: '11px',
                  letterSpacing: '0.04em',
                  color: 'rgba(245,237,224,0.4)',
                  textDecoration: 'none',
                  padding: '7px 0',
                  borderLeft: '1px solid rgba(245,237,224,0.08)',
                  paddingLeft: '14px',
                  lineHeight: 1.4,
                  transition: 'color 150ms, border-color 150ms',
                }}
              >
                {section.label}
              </a>
            ))}
            <a
              href="#verify"
              style={{
                display: 'block',
                fontFamily: 'var(--font-jost)',
                fontWeight: 300,
                fontSize: '11px',
                letterSpacing: '0.04em',
                color: 'rgba(202,138,4,0.5)',
                textDecoration: 'none',
                padding: '7px 0 7px 14px',
                borderLeft: '1px solid rgba(202,138,4,0.15)',
                lineHeight: 1.4,
                transition: 'color 150ms',
              }}
            >
              ↳ Verify a draw
            </a>
          </nav>

          {/* FAQ content */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {faqData.map((section) => (
              <section key={section.id} id={section.id} style={{ marginBottom: '56px' }}>
                <span style={s.sectionLabel}>{section.label}</span>
                <div>
                  {section.items.map((item, i) => (
                    <details key={i} className="faq-item">
                      <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', padding: '18px 0' }}>
                        <span className="faq-q" style={s.question}>{item.q}</span>
                        <span className="faq-icon">+</span>
                      </summary>
                      <div className="faq-answer" style={{ paddingBottom: '20px' }}>
                        <p style={s.answer}>{item.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}

            {/* ── Draw Verification — special section ── */}
            <section id="verify" style={{ marginBottom: '56px' }}>
              <span style={s.sectionLabel}>07 — Verifying the Draw</span>

              <details className="faq-item">
                <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', padding: '18px 0' }}>
                  <span className="faq-q" style={s.question}>How do I verify a draw result?</span>
                  <span className="faq-icon">+</span>
                </summary>
                <div className="faq-answer" style={{ paddingBottom: '8px' }}>

                  {/* ELI5 — always visible within the answer */}
                  <div style={{ padding: '20px', background: 'var(--walnut)', borderTop: '1px solid rgba(202,138,4,0.2)', marginBottom: '16px' }}>
                    <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px', opacity: 0.8 }}>
                      Simple version
                    </p>
                    <p style={s.answer}>
                      When the draw runs, we pick a winning ticket using the same type of randomness that secures bank encryption
                      — not a coin flip, not a spreadsheet. The moment a winner is selected, we lock the result: we take the drop ID,
                      every entry ID in the order they were placed, and the winning ticket number, combine them, and run it through
                      SHA-256 — a one-way fingerprinting algorithm. That fingerprint is the verification hash. It&apos;s published
                      and permanent. If anyone — including us — tried to swap the winner after the fact, the hash wouldn&apos;t match
                      and you&apos;d see it instantly. Anyone can recompute it using the public inputs and check.
                    </p>
                  </div>

                  {/* Excruciating Detail toggle */}
                  <details className="eli5-toggle">
                    <summary style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: '1px solid rgba(202,138,4,0.2)', cursor: 'pointer', marginBottom: '16px' }}>
                      <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                        Excruciating Detail
                      </span>
                      <span className="eli5-icon" style={{ color: 'var(--gold)' }}>▾</span>
                    </summary>

                    <div style={{ padding: '24px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(245,237,224,0.06)', marginBottom: '20px' }}>
                      <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '20px', opacity: 0.7 }}>
                        Technical specification
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {[
                          {
                            n: '1',
                            title: 'Random number generation',
                            body: `The winning ticket is selected using Node.js crypto.randomInt(0, totalTickets) — a CSPRNG (Cryptographically Secure Pseudo-Random Number Generator) that draws from the operating system's entropy pool. This is the same class of randomness used in TLS, SSL, and cryptographic key generation. Unlike Math.random(), it cannot be predicted or reverse-engineered.`,
                          },
                          {
                            n: '2',
                            title: 'Ticket pool construction',
                            body: 'All entries for the drop are fetched in chronological order (creation timestamp ascending). Each entry is expanded into ticket slots based on spots_count (1 or 2). Slots are assigned sequential 0-indexed ticket numbers. The total pool size equals the sum of all spots purchased.',
                          },
                          {
                            n: '3',
                            title: 'Verification hash formula',
                            body: null,
                            code: 'SHA-256( drop_id + "|" + entry_id_1 + "," + entry_id_2 + "," + ... + "|" + winning_ticket_index )',
                          },
                          {
                            n: '4',
                            title: 'How to independently verify',
                            body: `Go to /verify/[drop-slug]. The page shows: all entry IDs in order, the winning ticket index, total tickets in pool, and the published hash. Compute the hash formula above using those values. If your result matches the published hash, the draw record is intact and unmodified. The source code of the verification page is readable — there are no black boxes.`,
                          },
                          {
                            n: '5',
                            title: 'What this proves',
                            body: 'The hash is a tamper-evident seal. If anyone changes the recorded winner, total ticket count, or entry order after the fact, the hash fails. This proves the stored record was not altered post-draw.',
                          },
                        ].map((step) => (
                          <div key={step.n} style={{ display: 'flex', gap: '16px' }}>
                            <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--gold)', opacity: 0.6, flexShrink: 0, paddingTop: '2px' }}>{step.n}</span>
                            <div>
                              <p style={{ fontFamily: 'var(--font-jost)', fontWeight: 500, fontSize: '12px', color: 'var(--cream)', marginBottom: '6px' }}>{step.title}</p>
                              {step.body && <p style={{ fontFamily: 'var(--font-jost)', fontWeight: 300, fontSize: '12px', lineHeight: 1.75, color: 'rgba(245,237,224,0.5)' }}>{step.body}</p>}
                              {step.code && (
                                <pre style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--gold)', background: 'rgba(202,138,4,0.05)', border: '1px solid rgba(202,138,4,0.15)', padding: '12px 14px', overflowX: 'auto', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                  {step.code}
                                </pre>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>

                  <Link
                    href="/winners"
                    style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}
                  >
                    See all draw records →
                  </Link>
                </div>
              </details>
            </section>

            {/* Bottom CTA */}
            <div style={{ borderTop: '1px solid rgba(245,237,224,0.06)', paddingTop: '32px' }}>
              <p style={{ fontFamily: 'var(--font-jost)', fontWeight: 300, fontSize: '13px', color: 'rgba(245,237,224,0.35)', marginBottom: '16px', lineHeight: 1.7 }}>
                Still have questions?
              </p>
              <a
                href="mailto:support@dedstok.xyz"
                style={{ fontFamily: 'var(--font-jost)', fontWeight: 400, fontSize: '13px', color: 'var(--gold)', textDecoration: 'none', letterSpacing: '0.04em' }}
              >
                support@dedstok.xyz →
              </a>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
