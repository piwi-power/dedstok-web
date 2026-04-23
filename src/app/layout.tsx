import type { Metadata } from 'next'
import { Bodoni_Moda, Jost, DM_Mono, Bebas_Neue, Cinzel, Cormorant_Garamond, Playfair_Display, Alex_Brush, Italiana, Anton, Black_Han_Sans, Barlow_Condensed } from 'next/font/google'
import { headers } from 'next/headers'
import dynamic from 'next/dynamic'
import './globals.css'
import Nav from '@/components/Nav'
import InkTransitionProvider from '@/components/InkTransitionProvider'

const PagePreloader = dynamic(() => import('@/components/PagePreloader'), { ssr: false })

const bodoni = Bodoni_Moda({
  variable: '--font-bodoni',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
})

const bebas = Bebas_Neue({
  variable: '--font-bebas',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})

// Current wordmark font — Roman inscription
const cinzel = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  display: 'swap',
})

// ── Wordmark candidates (for /fonts preview page) ─────────────────────────────

// Option A: Couture-house italic serif — most refined
const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

// Option B: Fashion-editorial bold serif — The Row / Vogue energy
const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
})

// Option C: Luxury script — closest to genuine handwriting
const alexBrush = Alex_Brush({
  variable: '--font-alex-brush',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})

// Option D: Italian fashion house — clean display serif with attitude
const italiana = Italiana({
  variable: '--font-italiana',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})

// ── Heavy graphic candidates ───────────────────────────────────────────────────

// Memphis rap / Savage Mode energy — cold, condensed, dominant
const anton = Anton({
  variable: '--font-anton',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})

// Maximum weight — ultra-black, uncompromising, the heaviest option
const blackHanSans = Black_Han_Sans({
  variable: '--font-black-han-sans',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})

// Condensed grotesque — clean, cold, scales from nav to billboard
const barlowCondensed = Barlow_Condensed({
  variable: '--font-barlow-condensed',
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'DEDSTOK — One Drop. One Winner. Every Week.',
    template: '%s | DEDSTOK',
  },
  description:
    'A weekly raffle for curated streetwear grails. One item, one winner, pure luck. Based in Lebanon.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dedstok.com'
  ),
  openGraph: {
    siteName: 'DEDSTOK',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-invoke-path') ?? headersList.get('next-url') ?? ''
  const isAdmin = pathname.startsWith('/admin')
  const isHomepage = pathname === '/' || pathname === ''

  return (
    <html
      lang="en"
      className={`
        ${bodoni.variable}
        ${jost.variable}
        ${dmMono.variable}
        ${bebas.variable}
        ${cinzel.variable}
        ${cormorant.variable}
        ${playfair.variable}
        ${alexBrush.variable}
        ${italiana.variable}
        ${anton.variable}
        ${blackHanSans.variable}
        ${barlowCondensed.variable}
        h-full
      `}
    >
      <body className="min-h-full bg-[var(--bg)] text-[var(--cream)] antialiased">
        <InkTransitionProvider>
          {!isAdmin && <Nav />}
          {/* Homepage: room fills the full viewport, nav floats over it transparently.
              All other pages: 64px offset below the fixed nav (nav height = 64px). */}
          <div style={isAdmin || isHomepage ? {} : { paddingTop: '64px' }}>
            {children}
          </div>
          <PagePreloader />
        </InkTransitionProvider>
      </body>
    </html>
  )
}
