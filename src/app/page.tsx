// Homepage — 3D interactive store experience
// The Spline scene embeds here once the designer delivers the .splinecode file.
// All business logic (raffle, auth, payments) is wired independently.

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
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
    </main>
  )
}
