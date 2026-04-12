import { createClient } from '@/lib/supabase/server'
import AuthForm from '@/components/AuthForm'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string; next?: string; ref?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { auth, next, ref } = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-8 max-w-sm w-full">
        <div className="space-y-4">
          <p
            style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.4em' }}
            className="text-[var(--gold)] text-xs uppercase"
          >
            Coming Soon
          </p>
          <h1
            style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.2em' }}
            className="text-[var(--cream)] text-[96px] leading-none"
          >
            DEDSTOK
          </h1>
          <p
            style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.25em' }}
            className="text-[var(--cream-dim)] text-xs uppercase"
          >
            One drop. One winner. Every week.
          </p>
        </div>

        <div className="pt-4">
          {user ? (
            <div className="space-y-3">
              <p
                style={{ fontFamily: 'var(--font-dm-mono)' }}
                className="text-[var(--cream-dim)] text-xs"
              >
                Signed in as <span className="text-[var(--cream)]">{user.email}</span>
              </p>
              <a
                href="/account"
                style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.2em' }}
                className="inline-block text-[var(--gold)] text-xs uppercase hover:text-[var(--gold-light)] transition-colors"
              >
                View Account
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {auth === 'required' && (
                <p
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                  className="text-[var(--cream-dim)] text-xs"
                >
                  Sign in to enter the raffle.
                </p>
              )}
              {auth === 'error' && (
                <p className="text-red-400 text-xs">
                  Link expired or invalid. Request a new one.
                </p>
              )}
              <AuthForm redirectTo={next ?? '/account'} referralCode={ref} />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
