export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import AdminDrawButton from '@/components/AdminDrawButton'
import AdminAnnounceButton from '@/components/AdminAnnounceButton'
import AdminResendSmsButton from '@/components/AdminResendSmsButton'
import AdminInfluencerPanel from '@/components/AdminInfluencerPanel'
import AdminDropPanel from '@/components/AdminDropPanel'

export default async function AdminPage() {
  // Auth check
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (!session || session !== process.env.ADMIN_SECRET) {
    redirect('/admin/login')
  }

  const supabase = createServiceClient()

  // Fetch all drops with full data
  const { data: drops } = await supabase
    .from('drops')
    .select('id, item_name, slug, description, entry_price, total_spots, spots_sold, draw_date, market_value, sourcing_tier, status, created_at, image_url')
    .order('created_at', { ascending: false })

  const dropIds = drops?.map(d => d.id) ?? []

  // Fetch entries grouped by drop
  const { data: allEntries } = await supabase
    .from('entries')
    .select('id, drop_id, user_id, spots_count, total_paid, influencer_code, created_at, users(email)')
    .in('drop_id', dropIds.length ? dropIds : ['none'])
    .order('created_at', { ascending: false })

  // Fetch all winners (including unannounced — admin sees everything)
  const { data: winners } = await supabase
    .from('winners')
    .select('id, drop_id, drawn_at, announced, total_tickets, winning_ticket, verification_hash, users(email, phone)')
    .order('drawn_at', { ascending: false })

  // Fetch influencer codes
  const { data: influencerCodes } = await supabase
    .from('influencer_codes')
    .select('*')
    .order('created_at', { ascending: false })

  // Stats
  const totalEntries = allEntries?.length ?? 0
  const totalRevenue = allEntries?.reduce((sum, e) => sum + (e.total_paid ?? 0), 0) ?? 0
  const totalUsers = new Set(allEntries?.map(e => e.user_id)).size

  const activeDrops = drops?.filter(d => d.status === 'active') ?? []
  const closedDrops = drops?.filter(d => d.status === 'closed') ?? []

  return (
    <main style={{ background: '#0c0a09', minHeight: '100vh', padding: '32px 24px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ color: '#CA8A04', fontSize: '20px', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '2px' }}>
              DEDSTOK
            </h1>
            <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Admin Dashboard
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <a
              href="/admin/users"
              style={{ color: '#CA8A04', fontSize: '12px', textDecoration: 'none', letterSpacing: '0.05em' }}
            >
              Customers
            </a>
            <a
              href="/"
              style={{ color: 'rgba(245,237,224,0.35)', fontSize: '12px', textDecoration: 'none' }}
            >
              Back to site
            </a>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '40px' }}>
          {[
            { label: 'Total Entries', value: totalEntries },
            { label: 'Unique Entrants', value: totalUsers },
            { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}` },
            { label: 'Active Drops', value: activeDrops.length },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(245,237,224,0.04)', border: '1px solid rgba(245,237,224,0.08)', borderRadius: '4px', padding: '20px' }}>
              <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
                {stat.label}
              </p>
              <p style={{ color: '#f5ede0', fontSize: '24px', fontWeight: 700 }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Drop management — create, edit, delete, status */}
        <AdminDropPanel drops={drops ?? []} />

        {/* Active drops — draw controls and entry tables */}
        <section style={{ marginBottom: '48px' }}>
          <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Active Drop Controls
          </p>
          {activeDrops.length === 0 ? (
            <div style={{ border: '1px solid rgba(245,237,224,0.08)', borderRadius: '4px', padding: '32px', textAlign: 'center' }}>
              <p style={{ color: 'rgba(245,237,224,0.3)', fontSize: '13px' }}>No active drops.</p>
            </div>
          ) : (
            activeDrops.map(drop => {
              const dropEntries = allEntries?.filter(e => e.drop_id === drop.id) ?? []
              const totalTickets = dropEntries.reduce((sum, e) => sum + (e.spots_count ?? 0), 0)
              const dropRevenue = dropEntries.reduce((sum, e) => sum + (e.total_paid ?? 0), 0)
              const dropData = drops?.find(d => d.id === drop.id)

              return (
                <div key={drop.id} style={{ border: '1px solid rgba(202,138,4,0.3)', borderRadius: '4px', padding: '24px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                      <p style={{ color: '#f5ede0', fontSize: '15px', fontWeight: 600, fontFamily: 'sans-serif', marginBottom: '6px' }}>
                        {dropData?.item_name ?? drop.id}
                      </p>
                      <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                        <div>
                          <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Entrants</p>
                          <p style={{ color: '#f5ede0', fontSize: '20px', fontWeight: 700 }}>{dropEntries.length}</p>
                        </div>
                        <div>
                          <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Total Tickets</p>
                          <p style={{ color: '#f5ede0', fontSize: '20px', fontWeight: 700 }}>{totalTickets}</p>
                        </div>
                        <div>
                          <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Revenue</p>
                          <p style={{ color: '#CA8A04', fontSize: '20px', fontWeight: 700 }}>${dropRevenue.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    <AdminDrawButton dropId={drop.id} entryCount={dropEntries.length} />
                  </div>

                  {dropEntries.length > 0 && (
                    <div style={{ borderTop: '1px solid rgba(245,237,224,0.06)', paddingTop: '20px' }}>
                      <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>Entries</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 140px', gap: '0', fontSize: '11px' }}>
                        <div style={{ color: 'rgba(245,237,224,0.3)', padding: '6px 0', borderBottom: '1px solid rgba(245,237,224,0.06)' }}>Email</div>
                        <div style={{ color: 'rgba(245,237,224,0.3)', padding: '6px 0', borderBottom: '1px solid rgba(245,237,224,0.06)', textAlign: 'center' }}>Spots</div>
                        <div style={{ color: 'rgba(245,237,224,0.3)', padding: '6px 0', borderBottom: '1px solid rgba(245,237,224,0.06)', textAlign: 'right' }}>Paid</div>
                        <div style={{ color: 'rgba(245,237,224,0.3)', padding: '6px 0', borderBottom: '1px solid rgba(245,237,224,0.06)', textAlign: 'right' }}>Date</div>
                        {dropEntries.map(entry => {
                          const user = entry.users as unknown as { email: string } | null
                          return (
                            <>
                              <div key={`${entry.id}-email`} style={{ color: 'rgba(245,237,224,0.7)', padding: '8px 0', borderBottom: '1px solid rgba(245,237,224,0.04)', fontFamily: 'monospace' }}>
                                {user?.email ?? entry.user_id.slice(0, 8)}
                                {entry.influencer_code && <span style={{ marginLeft: '8px', color: '#CA8A04', fontSize: '9px' }}>{entry.influencer_code}</span>}
                              </div>
                              <div key={`${entry.id}-spots`} style={{ color: '#f5ede0', padding: '8px 0', borderBottom: '1px solid rgba(245,237,224,0.04)', textAlign: 'center' }}>{entry.spots_count}</div>
                              <div key={`${entry.id}-paid`} style={{ color: '#f5ede0', padding: '8px 0', borderBottom: '1px solid rgba(245,237,224,0.04)', textAlign: 'right' }}>${entry.total_paid}</div>
                              <div key={`${entry.id}-date`} style={{ color: 'rgba(245,237,224,0.4)', padding: '8px 0', borderBottom: '1px solid rgba(245,237,224,0.04)', textAlign: 'right' }}>
                                {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </section>

        {/* Winners */}
        <section style={{ marginBottom: '48px' }}>
          <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Draw Results
          </p>

          {!winners || winners.length === 0 ? (
            <div style={{ border: '1px solid rgba(245,237,224,0.08)', borderRadius: '4px', padding: '32px', textAlign: 'center' }}>
              <p style={{ color: 'rgba(245,237,224,0.3)', fontSize: '13px' }}>No draws yet.</p>
            </div>
          ) : (
            winners.map(w => {
              const winnerUser = w.users as unknown as { email: string; phone: string } | null
              return (
                <div key={w.id} style={{ border: '1px solid rgba(245,237,224,0.08)', borderRadius: '4px', padding: '24px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{
                          background: w.announced ? 'rgba(34,197,94,0.15)' : 'rgba(245,237,224,0.08)',
                          color: w.announced ? '#22c55e' : 'rgba(245,237,224,0.4)',
                          fontSize: '10px',
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: '2px',
                        }}>
                          {w.announced ? 'Announced' : 'Pending announcement'}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: '24px', marginBottom: '16px' }}>
                        <div>
                          <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Winner</p>
                          <p style={{ color: '#f5ede0', fontSize: '14px', fontFamily: 'monospace' }}>{winnerUser?.email ?? 'Unknown'}</p>
                        </div>
                        <div>
                          <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Phone</p>
                          <p style={{ color: '#f5ede0', fontSize: '14px', fontFamily: 'monospace' }}>{winnerUser?.phone ?? 'Not set'}</p>
                        </div>
                        <div>
                          <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Winning ticket</p>
                          <p style={{ color: '#f5ede0', fontSize: '14px' }}>
                            #{(w.winning_ticket as number) + 1} of {w.total_tickets}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Verification hash</p>
                        <p style={{ color: 'rgba(245,237,224,0.5)', fontSize: '11px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{w.verification_hash as string}</p>
                      </div>
                      <p style={{ color: 'rgba(245,237,224,0.25)', fontSize: '11px', marginTop: '8px' }}>
                        Drawn: {new Date(w.drawn_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div style={{ marginLeft: '24px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                      {!w.announced && <AdminAnnounceButton winnerId={w.id} />}
                      <AdminResendSmsButton winnerId={w.id} />
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </section>


        {/* Influencer codes */}
        <AdminInfluencerPanel codes={influencerCodes ?? []} />

      </div>
    </main>
  )
}
