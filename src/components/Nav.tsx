import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Nav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: 'rgba(12,10,9,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(245,237,224,0.08)',
      padding: '0 24px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <Link href="/" style={{
        color: '#CA8A04',
        fontFamily: 'sans-serif',
        fontWeight: 700,
        fontSize: '16px',
        letterSpacing: '0.15em',
        textDecoration: 'none',
      }}>
        DEDSTOK
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link href="/drops" style={linkStyle}>Drops</Link>
        <Link href="/winners" style={linkStyle}>Winners</Link>
        <Link href="/leaderboard" style={linkStyle}>Leaderboard</Link>
        <Link href="/articles" style={linkStyle}>Articles</Link>
        {user ? (
          <Link href="/account" style={{ ...linkStyle, color: '#CA8A04' }}>Account</Link>
        ) : (
          <Link href="/?auth=required" style={{
            ...linkStyle,
            background: '#CA8A04',
            color: '#0c0a09',
            padding: '6px 16px',
            borderRadius: '4px',
            fontWeight: 700,
          }}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  )
}

const linkStyle: React.CSSProperties = {
  color: 'rgba(245,237,224,0.6)',
  fontFamily: 'sans-serif',
  fontSize: '12px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  transition: 'color 0.15s',
}
