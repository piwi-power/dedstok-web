interface InfluencerCodeData {
  code: string
  influencer_name: string
  instagram_handle: string | null
  commission_rate: number
  total_tickets_credited: number
  total_commission_earned: number
  total_pending_payout: number
  last_payout_date: string | null
  is_active: boolean
}

function nextPayoutDate(): string {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return next.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function InfluencerEarningsCard({ code }: { code: InfluencerCodeData }) {
  const rate = Math.round(code.commission_rate * 100)

  const stat = (label: string, value: string, highlight?: boolean) => (
    <div style={{ background: 'rgba(245,237,224,0.03)', border: '1px solid rgba(245,237,224,0.08)', borderRadius: '4px', padding: '16px 20px' }}>
      <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '6px' }}>
        {label}
      </p>
      <p style={{ color: highlight ? '#CA8A04' : '#f5ede0', fontSize: '22px', fontWeight: 700, fontFamily: 'sans-serif' }}>
        {value}
      </p>
    </div>
  )

  return (
    <div style={{ background: 'rgba(202,138,4,0.04)', border: '1px solid rgba(202,138,4,0.25)', borderRadius: '4px', padding: '24px', marginBottom: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '4px' }}>
            Creator Earnings
          </p>
          <p style={{ color: '#CA8A04', fontFamily: 'monospace', fontSize: '18px', fontWeight: 700 }}>
            {code.code}
          </p>
          {code.instagram_handle && (
            <p style={{ color: 'rgba(245,237,224,0.4)', fontSize: '12px', fontFamily: 'sans-serif', marginTop: '2px' }}>
              {code.instagram_handle}
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{
            background: code.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(245,237,224,0.06)',
            color: code.is_active ? '#22c55e' : 'rgba(245,237,224,0.35)',
            border: `1px solid ${code.is_active ? 'rgba(34,197,94,0.3)' : 'rgba(245,237,224,0.1)'}`,
            borderRadius: '4px',
            padding: '4px 12px',
            fontSize: '10px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
          }}>
            {code.is_active ? 'Active' : 'Paused'}
          </span>
          <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '11px', fontFamily: 'sans-serif', marginTop: '6px' }}>
            {rate}% per ticket
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {stat('Tickets Driven', code.total_tickets_credited.toString())}
        {stat('Total Earned', `$${code.total_commission_earned.toFixed(2)}`)}
        {stat('Pending Payout', `$${code.total_pending_payout.toFixed(2)}`, code.total_pending_payout > 0)}
        {stat('Last Payout', code.last_payout_date
          ? new Date(code.last_payout_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'None yet'
        )}
      </div>

      {/* Payout info */}
      <div style={{ borderTop: '1px solid rgba(245,237,224,0.07)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'rgba(245,237,224,0.3)', fontSize: '12px', fontFamily: 'sans-serif' }}>
          Payouts are processed on the 1st of every month.
        </p>
        <p style={{ color: code.total_pending_payout > 0 ? '#CA8A04' : 'rgba(245,237,224,0.25)', fontSize: '12px', fontFamily: 'sans-serif', fontWeight: 600 }}>
          {code.total_pending_payout > 0
            ? `Next payout: ${nextPayoutDate()}`
            : 'Nothing pending'
          }
        </p>
      </div>
    </div>
  )
}
