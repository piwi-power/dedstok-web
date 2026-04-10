import type { Metadata } from 'next'
import { Bodoni_Moda, Jost, DM_Mono, Bebas_Neue } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`
        ${bodoni.variable}
        ${jost.variable}
        ${dmMono.variable}
        ${bebas.variable}
        h-full
      `}
    >
      <body className="min-h-full bg-[var(--bg)] text-[var(--cream)] antialiased">
        <Nav />
        <div style={{ paddingTop: '56px' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
