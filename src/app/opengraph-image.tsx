import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import { join } from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const alt = 'DEDSTOK — One Drop. One Winner. Every Week.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const antonFont = await readFile(join(process.cwd(), 'public/fonts/anton.ttf'))

  return new ImageResponse(
    (
      <div
        style={{
          background: '#080604',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Corner brackets */}
        <div style={{ position: 'absolute', top: 40, left: 40, width: 36, height: 36, borderTop: '2px solid #CA8A04', borderLeft: '2px solid #CA8A04', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 40, right: 40, width: 36, height: 36, borderTop: '2px solid #CA8A04', borderRight: '2px solid #CA8A04', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 40, left: 40, width: 36, height: 36, borderBottom: '2px solid #CA8A04', borderLeft: '2px solid #CA8A04', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 40, right: 40, width: 36, height: 36, borderBottom: '2px solid #CA8A04', borderRight: '2px solid #CA8A04', display: 'flex' }} />

        {/* Gold accent line */}
        <div style={{ width: 48, height: 1, background: 'rgba(202,138,4,0.5)', marginBottom: 32, display: 'flex' }} />

        {/* Wordmark */}
        <div style={{
          color: '#f5ede0',
          fontSize: 136,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontFamily: 'Anton',
          lineHeight: 1,
          marginBottom: 32,
          display: 'flex',
        }}>
          DEDSTOK
        </div>

        {/* Tagline */}
        <div style={{
          color: '#CA8A04',
          fontSize: 28,
          letterSpacing: '0.38em',
          textTransform: 'uppercase',
          fontFamily: 'Anton',
          display: 'flex',
        }}>
          ONE DROP. ONE WINNER. EVERY WEEK.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Anton', data: antonFont, style: 'normal' }],
    }
  )
}
