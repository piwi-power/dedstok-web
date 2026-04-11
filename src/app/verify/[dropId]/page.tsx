import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VerifyClient from './VerifyClient'

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

  if (!winner || !winner.announced) notFound()

  const inputs = winner.draw_inputs as {
    drop_id: string
    entry_ids_in_order: string[]
    total_tickets: number
    winning_ticket_index: number
    algorithm: string
    verification_note: string
  }

  // Reconstruct the exact string that was hashed
  const hashInput = `${inputs.drop_id}|${inputs.entry_ids_in_order.join(',')}|${inputs.winning_ticket_index}`

  return (
    <main style={{ minHeight: '100vh', padding: '60px 24px', maxWidth: '760px', margin: '0 auto', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <p style={{ color: '#CA8A04', fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '16px' }}>
        Draw Verification
      </p>
      <h1 style={{ color: '#f5ede0', fontSize: '36px', fontWeight: 700, marginBottom: '12px' }}>
        Verify This Draw
      </h1>
      <p style={{ color: 'rgba(245,237,224,0.5)', fontSize: '14px', lineHeight: 1.7, marginBottom: '48px', maxWidth: '580px' }}>
        Every DEDSTOK draw is provably fair. This page gives you everything you need to independently verify that the winner was chosen by math, not by us. You do not need to trust DEDSTOK -- you can prove it yourself.
      </p>

      {/* Step 1 */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ background: '#CA8A04', color: '#0c0a09', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>1</span>
          <h2 style={{ color: '#f5ede0', fontSize: '16px', fontWeight: 700 }}>The Draw Inputs</h2>
        </div>
        <p style={{ color: 'rgba(245,237,224,0.5)', fontSize: '13px', lineHeight: 1.7, marginBottom: '20px', paddingLeft: '36px' }}>
          These are the exact inputs used to produce the winner. The entry IDs are sorted by time of purchase — first in, first in the pool. Each spot purchased = one ticket. Buying 2 spots gives you 2 consecutive tickets.
        </p>

        <div style={{ paddingLeft: '36px', display: 'grid', gap: '12px' }}>
          <div style={{ background: 'rgba(245,237,224,0.04)', border: '1px solid rgba(245,237,224,0.08)', borderRadius: '4px', padding: '16px' }}>
            <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>Drop ID</p>
            <p style={{ color: '#f5ede0', fontFamily: 'monospace', fontSize: '13px', wordBreak: 'break-all' }}>{inputs.drop_id}</p>
          </div>

          <div style={{ background: 'rgba(245,237,224,0.04)', border: '1px solid rgba(245,237,224,0.08)', borderRadius: '4px', padding: '16px' }}>
            <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>
              Entry IDs in draw order ({inputs.entry_ids_in_order.length} entries, {inputs.total_tickets} total tickets)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {inputs.entry_ids_in_order.map((id, i) => (
                <p key={id} style={{ color: '#f5ede0', fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all' }}>
                  <span style={{ color: 'rgba(245,237,224,0.3)', marginRight: '12px', minWidth: '20px', display: 'inline-block' }}>{i + 1}.</span>{id}
                </p>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(245,237,224,0.04)', border: '1px solid rgba(245,237,224,0.08)', borderRadius: '4px', padding: '16px' }}>
            <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>Winning Ticket Index (0-based)</p>
            <p style={{ color: '#CA8A04', fontFamily: 'monospace', fontSize: '20px', fontWeight: 700 }}>
              {inputs.winning_ticket_index} <span style={{ color: 'rgba(245,237,224,0.35)', fontSize: '13px', fontWeight: 400 }}>= ticket #{(winner.winning_ticket as number) + 1} of {winner.total_tickets}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ background: '#CA8A04', color: '#0c0a09', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>2</span>
          <h2 style={{ color: '#f5ede0', fontSize: '16px', fontWeight: 700 }}>The String That Was Hashed</h2>
        </div>
        <p style={{ color: 'rgba(245,237,224,0.5)', fontSize: '13px', lineHeight: 1.7, marginBottom: '20px', paddingLeft: '36px' }}>
          These inputs are joined into one string, then passed through SHA-256. The format is: <span style={{ fontFamily: 'monospace', color: 'rgba(245,237,224,0.7)' }}>drop_id | entry_ids_csv | winning_ticket_index</span>
        </p>
        <div style={{ paddingLeft: '36px' }}>
          <div style={{ background: 'rgba(245,237,224,0.04)', border: '1px solid rgba(245,237,224,0.08)', borderRadius: '4px', padding: '16px' }}>
            <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>Exact string (copy this)</p>
            <p style={{ color: '#f5ede0', fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all', lineHeight: 1.6 }}>{hashInput}</p>
          </div>
        </div>
      </div>

      {/* Step 3 — interactive */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ background: '#CA8A04', color: '#0c0a09', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>3</span>
          <h2 style={{ color: '#f5ede0', fontSize: '16px', fontWeight: 700 }}>Run SHA-256 and Compare</h2>
        </div>
        <p style={{ color: 'rgba(245,237,224,0.5)', fontSize: '13px', lineHeight: 1.7, marginBottom: '20px', paddingLeft: '36px' }}>
          Paste the string above into any SHA-256 calculator (try <span style={{ color: '#CA8A04' }}>emn178.github.io/online-tools/sha256.html</span>) or click the button below to verify it right here in your browser. The result must match the hash below exactly.
        </p>
        <div style={{ paddingLeft: '36px' }}>
          <VerifyClient hashInput={hashInput} storedHash={winner.verification_hash as string} />
        </div>
      </div>

      {/* The stored hash */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ background: '#CA8A04', color: '#0c0a09', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>4</span>
          <h2 style={{ color: '#f5ede0', fontSize: '16px', fontWeight: 700 }}>The Published Hash</h2>
        </div>
        <p style={{ color: 'rgba(245,237,224,0.5)', fontSize: '13px', lineHeight: 1.7, marginBottom: '20px', paddingLeft: '36px' }}>
          This hash was recorded at the moment of the draw and cannot be changed retroactively. If your SHA-256 output matches this exactly, the draw is verified.
        </p>
        <div style={{ paddingLeft: '36px' }}>
          <div style={{ background: 'rgba(202,138,4,0.06)', border: '1px solid rgba(202,138,4,0.25)', borderRadius: '4px', padding: '20px' }}>
            <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>SHA-256 Verification Hash</p>
            <p style={{ color: '#CA8A04', fontFamily: 'monospace', fontSize: '13px', wordBreak: 'break-all' }}>{winner.verification_hash as string}</p>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div style={{ borderTop: '1px solid rgba(245,237,224,0.08)', paddingTop: '32px' }}>
        <p style={{ color: 'rgba(245,237,224,0.25)', fontSize: '12px', lineHeight: 1.7 }}>
          SHA-256 is a one-way cryptographic hash function. It is mathematically impossible to produce a specific hash output without knowing the exact inputs. This means DEDSTOK cannot have chosen the winner after the fact -- the hash proves the inputs were fixed before the draw result was known.
        </p>
        <p style={{ color: 'rgba(245,237,224,0.25)', fontSize: '12px', marginTop: '8px' }}>
          Draw ran: {new Date(winner.drawn_at).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
        </p>
      </div>

    </main>
  )
}
