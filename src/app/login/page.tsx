export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import AuthForm from '@/components/AuthForm'

export const metadata: Metadata = {
  title: 'Sign In — DEDSTOK',
}

interface Props {
  searchParams: Promise<{ next?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams

  const supabase = await createClient()
  const { data: activeDrop } = await supabase
    .from('drops')
    .select('image_url, item_name')
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  const hasImage = !!activeDrop?.image_url

  return (
    <>
      <style>{`
        .login-grid {
          display: grid;
          grid-template-columns: ${hasImage ? '1fr 1fr' : '1fr'};
          min-height: 100vh;
        }
        .login-image-panel { display: block; }
        @media (max-width: 768px) {
          .login-grid { grid-template-columns: 1fr; }
          .login-image-panel { display: none; }
          .login-form-panel { padding: 80px 32px 80px !important; }
        }
      `}</style>

      <main className="login-grid">

        {/* Left: current drop image */}
        {hasImage && (
          <div
            className="login-image-panel"
            style={{ position: 'relative', overflow: 'hidden', background: 'var(--walnut)' }}
          >
            <img
              src={activeDrop!.image_url!}
              alt={activeDrop!.item_name}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />

            {/* Bottom gradient */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(12,10,9,0.75) 0%, transparent 50%)',
            }} />

            {/* Live badge */}
            <div style={{
              position: 'absolute',
              top: '80px',
              left: '28px',
              background: 'rgba(12,10,9,0.72)',
              backdropFilter: 'blur(8px)',
              padding: '5px 12px',
            }}>
              <p style={{
                fontFamily: 'var(--font-dm-mono)',
                color: 'var(--gold)',
                fontSize: '8px',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
              }}>
                Live Drop
              </p>
            </div>

            {/* Item name bottom */}
            <div style={{ position: 'absolute', bottom: '36px', left: '28px', right: '28px' }}>
              <p style={{
                fontFamily: 'var(--font-dm-mono)',
                color: 'rgba(245,237,224,0.35)',
                fontSize: '8px',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}>
                This Week
              </p>
              <p style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 700,
                color: 'var(--cream)',
                fontSize: 'clamp(24px, 3vw, 40px)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}>
                {activeDrop!.item_name}
              </p>
            </div>
          </div>
        )}

        {/* Right: form */}
        <div
          className="login-form-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: hasImage ? '80px 64px' : '80px 24px',
            maxWidth: hasImage ? 'none' : '480px',
            margin: hasImage ? '0' : '0 auto',
            width: '100%',
            background: '#0c0a09',
          }}
        >

          {/* Wordmark */}
          <p style={{
            fontFamily: 'var(--font-anton)',
            fontSize: '14px',
            letterSpacing: '0.12em',
            color: 'var(--gold)',
            textTransform: 'uppercase',
            marginBottom: '48px',
          }}>
            DEDSTOK
          </p>

          {/* Decorative rule */}
          <div style={{
            width: '32px',
            height: '1px',
            background: 'rgba(202,138,4,0.4)',
            marginBottom: '24px',
          }} />

          {/* Heading */}
          <h1 style={{
            fontFamily: 'var(--font-jost)',
            fontWeight: 300,
            color: 'var(--cream)',
            fontSize: '28px',
            lineHeight: 1.2,
            marginBottom: '8px',
            letterSpacing: '-0.01em',
          }}>
            Sign in
          </h1>
          <p style={{
            fontFamily: 'var(--font-jost)',
            color: 'rgba(245,237,224,0.42)',
            fontSize: '13px',
            lineHeight: 1.6,
            marginBottom: '48px',
          }}>
            One account. Every drop. No password.
          </p>

          {/* Form */}
          <AuthForm redirectTo={next ?? '/'} error={error} />

        </div>
      </main>
    </>
  )
}
