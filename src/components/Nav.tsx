import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import ExploreOverlay from './ExploreOverlay'

export default async function Nav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const headersList = await headers()
  const pathname = headersList.get('x-invoke-path') ?? headersList.get('next-url') ?? ''
  const isHomepage = pathname === '/' || pathname === ''

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      // Transparent on homepage (room experience) — blurred on interior pages
      background: isHomepage
        ? 'transparent'
        : 'rgba(10, 8, 4, 0.88)',
      backdropFilter: isHomepage ? 'none' : 'blur(16px)',
      borderBottom: isHomepage
        ? 'none'
        : '1px solid rgba(44, 31, 18, 0.6)',
      transition: 'background 300ms ease, border-color 300ms ease',
    }}>

      {/* Left: Wordmark only — Anton (LOCKED) */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{
          fontFamily: 'var(--font-anton)',
          fontSize: '22px',
          letterSpacing: '0.08em',
          color: 'var(--cream)',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}>
          DEDSTOK
        </span>
      </Link>

      {/* Center: Nav links — hidden on homepage (rooms are the nav) */}
      {!isHomepage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
          <NavLink href="/drops">Drops</NavLink>
          <NavLink href="/winners">Winners</NavLink>
          <NavLink href="/leaderboard">Leaderboard</NavLink>
          <NavLink href="/articles">Articles</NavLink>
        </div>
      )}

      {/* Right: Explore + Account / Sign in */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <ExploreOverlay />
        {user ? (
          <Link href="/account" style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            textDecoration: 'none',
            padding: '6px 0',
            transition: 'color 150ms ease-out',
          }}>
            Account
          </Link>
        ) : (
          <Link href="/?auth=required" style={{
            fontFamily: 'var(--font-jost)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--bg)',
            background: 'var(--gold)',
            textDecoration: 'none',
            padding: '8px 20px',
            borderRadius: '2px',
            transition: 'background 150ms ease-out',
          }}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      fontFamily: 'var(--font-dm-mono)',
      fontSize: '10px',
      fontWeight: 400,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color: 'var(--cream-dim)',
      textDecoration: 'none',
      transition: 'color 150ms ease-out',
      padding: '4px 0',
    }}>
      {children}
    </Link>
  )
}
