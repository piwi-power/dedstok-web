import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VerifyClient from './VerifyClient'
import BackButton from '@/components/BackButton'
import CopyButton from '@/components/CopyButton'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ dropId: string }>
}

export default async function VerifyPage({ params }: Props) {
  const { dropId } = await params
  const supabase = await createClient()

  const { data: winner } = await supabase
    .from('winners')
    .select('id, drawn_at, total_tickets, winning_ticket, verification_hash, draw_inputs, announced')
    .eq('drop_id', dropId)
    .single()

  if (!winner) notFound()

  const inputs = winner.draw_inputs as {
    drop_id: string
    entry_ids_in_order: string[]
    total_tickets: number
    winning_ticket_index: number
    algorithm: string
    verification_note: string
  } | null

  if (!inputs?.entry_ids_in_order) notFound()

  // Reconstruct the exact string that was hashed
  const hashInput = `${inputs.drop_id}|${inputs.entry_ids_in_order.join(',')}|${inputs.winning_ticket_index}`

  return (
    <main style={{ minHeight: '100vh', padding: '80px 24px 120px', maxWidth: '760px', margin: '0 auto' }}>
      <BackButton href="/drops/archive" />

      {/* Header */}
      <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '16px' }}>
        Draw Verification
      </p>
      <h1 style={{ fontFamily: 'var(--font-anton)', color: 'var(--cream)', fontSize: '56px', letterSpacing: '0.02em', lineHeight: 1, marginBottom: '16px' }}>
        VERIFY THIS DRAW
      </h1>
      <p style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.5)', fontSize: '14px', lineHeight: 1.7, marginBottom: '56px', maxWidth: '580px' }}>
        Every DEDSTOK draw is provably fair. This page gives you everything you need to independently verify that the winner was chosen by math, not by us. You do not need to trust DEDSTOK — you can prove it yourself.
      </p>

      {/* Step 1 */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ background: 'var(--gold)', color: '#0c0a09', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-dm-mono)', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>1</span>
          <h2 style={{ fontFamily: 'var(--font-jost)', fontWeight: 600, color: 'var(--cream)', fontSize: '16px' }}>The Draw Inputs</h2>
        </div>
        <p style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.5)', fontSize: '13px', lineHeight: 1.7, marginBottom: '20px', paddingLeft: '36px' }}>
          These are the exact inputs used to produce the winner. The entry IDs are sorted by time of purchase — first in, first in the pool. Each spot purchased = one ticket. Buying 2 spots gives you 2 consecutive tickets.
        </p>

        <div style={{ paddingLeft: '36px', display: 'grid', gap: '12px' }}>
          <div style={{ background: 'rgba(245,237,224,0.04)', border: '1px solid rgba(245,237,224,0.08)', padding: '16px' }}>
            <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.35)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>Drop ID</p>
            <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--cream)', fontSize: '13px', wordBreak: 'break-all' }}>{inputs.drop_id}</p>
          </div>

          <div style={{ background: 'rgba(245,237,224,0.04)', border: '1px solid rgba(245,237,224,0.08)', padding: '16px' }}>
            <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.35)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>
              Entry IDs in draw order ({inputs.entry_ids_in_order.length} entries, {inputs.total_tickets} total tickets)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {inputs.entry_ids_in_order.map((id, i) => (
                <p key={id} style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--cream)', fontSize: '12px', wordBreak: 'break-all' }}>
                  <span style={{ color: 'rgba(245,237,224,0.3)', marginRight: '12px', minWidth: '20px', display: 'inline-block' }}>{i + 1}.</span>{id}
                </p>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(245,237,224,0.04)', border: '1px solid rgba(245,237,224,0.08)', padding: '16px' }}>
            <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.35)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>Winning Ticket Index (0-based)</p>
            <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '20px', fontWeight: 700 }}>
              {inputs.winning_ticket_index} <span style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.35)', fontSize: '13px', fontWeight: 400 }}>= ticket #{(winner.winning_ticket as number) + 1} of {winner.total_tickets}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ background: 'var(--gold)', color: '#0c0a09', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-dm-mono)', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>2</span>
          <h2 style={{ fontFamily: 'var(--font-jost)', fontWeight: 600, color: 'var(--cream)', fontSize: '16px' }}>The String That Was Hashed</h2>
        </div>
        <p style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.5)', fontSize: '13px', lineHeight: 1.7, marginBottom: '20px', paddingLeft: '36px' }}>
          These inputs are joined into one string, then passed through SHA-256. The format is:{' '}
          <span style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.7)', fontSize: '12px' }}>drop_id | entry_ids_csv | winning_ticket_index</span>
        </p>
        <div style={{ paddingLeft: '36px' }}>
          <div style={{ background: 'rgba(245,237,224,0.04)', border: '1px solid rgba(245,237,224,0.08)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.35)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Exact string (copy this)</p>
              <CopyButton text={hashInput} />
            </div>
            <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--cream)', fontSize: '11px', wordBreak: 'break-all', lineHeight: 1.6 }}>{hashInput}</p>
          </div>
        </div>
      </div>

      {/* Step 3 — interactive */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ background: 'var(--gold)', color: '#0c0a09', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-dm-mono)', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>3</span>
          <h2 style={{ fontFamily: 'var(--font-jost)', fontWeight: 600, color: 'var(--cream)', fontSize: '16px' }}>Run SHA-256 and Compare</h2>
        </div>
        <p style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.5)', fontSize: '13px', lineHeight: 1.7, marginBottom: '20px', paddingLeft: '36px' }}>
          Paste the string above into any SHA-256 calculator (try{' '}
          <a href="https://emn178.github.io/online-tools/sha256.html" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '12px', textDecoration: 'none', borderBottom: '1px solid rgba(202,138,4,0.35)' }}>emn178.github.io/online-tools/sha256.html</a>
          ) or click the button below to verify it right here in your browser. The result must match the hash below exactly.
        </p>
        <div style={{ paddingLeft: '36px' }}>
          <VerifyClient hashInput={hashInput} storedHash={winner.verification_hash as string} />
        </div>
      </div>

      {/* The stored hash */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ background: 'var(--gold)', color: '#0c0a09', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-dm-mono)', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>4</span>
          <h2 style={{ fontFamily: 'var(--font-jost)', fontWeight: 600, color: 'var(--cream)', fontSize: '16px' }}>The Published Hash</h2>
        </div>
        <p style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.5)', fontSize: '13px', lineHeight: 1.7, marginBottom: '20px', paddingLeft: '36px' }}>
          This hash was recorded at the moment of the draw and cannot be changed retroactively. If your SHA-256 output matches this exactly, the draw is verified.
        </p>
        <div style={{ paddingLeft: '36px' }}>
          <div style={{ background: 'rgba(202,138,4,0.06)', border: '1px solid rgba(202,138,4,0.25)', padding: '20px' }}>
            <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.35)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>SHA-256 Verification Hash</p>
            <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gold)', fontSize: '13px', wordBreak: 'break-all' }}>{winner.verification_hash as string}</p>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div style={{ borderTop: '1px solid rgba(245,237,224,0.08)', paddingTop: '32px' }}>
        <p style={{ fontFamily: 'var(--font-jost)', color: 'rgba(245,237,224,0.25)', fontSize: '12px', lineHeight: 1.7 }}>
          SHA-256 is a one-way cryptographic hash function. It is mathematically impossible to produce a specific hash output without knowing the exact inputs. This means DEDSTOK cannot have chosen the winner after the fact — the hash proves the inputs were fixed before the draw result was known.
        </p>
        <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(245,237,224,0.2)', fontSize: '10px', marginTop: '12px' }}>
          Draw ran: {new Date(winner.drawn_at).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
        </p>
      </div>

    </main>
  )
}
