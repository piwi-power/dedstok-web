import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'DEDSTOK — One Drop. One Winner. Every Week.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  // Fetch Anton from Google Fonts CDN — try woff2 first, fall back to woff
  const antonFont = await fetch(
    'https://fonts.gstatic.com/s/anton/v25/1Ptgg87LROyAm3K8-C8CSw.woff2'
  ).then(r => r.arrayBuffer()).catch(() =>
    fetch('https://fonts.gstatic.com/s/anton/v25/1Ptgg87LROyAm3Kz-C8CSw.woff').then(r => r.arrayBuffer())
  )

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
        <div style={{ position: 'absolute', top: 40, left: 40, width: 28, height: 28, borderTop: '1px solid rgba(202,138,4,0.45)', borderLeft: '1px solid rgba(202,138,4,0.45)', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 40, right: 40, width: 28, height: 28, borderTop: '1px solid rgba(202,138,4,0.45)', borderRight: '1px solid rgba(202,138,4,0.45)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 40, left: 40, width: 28, height: 28, borderBottom: '1px solid rgba(202,138,4,0.45)', borderLeft: '1px solid rgba(202,138,4,0.45)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 40, right: 40, width: 28, height: 28, borderBottom: '1px solid rgba(202,138,4,0.45)', borderRight: '1px solid rgba(202,138,4,0.45)', display: 'flex' }} />

        {/* Gold accent line */}
        <div style={{ width: 48, height: 1, background: 'rgba(202,138,4,0.5)', marginBottom: 32, display: 'flex' }} />

        {/* Wordmark — cream, Anton */}
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

        {/* Tagline — gold */}
        <div style={{
          color: '#CA8A04',
          fontSize: 16,
          letterSpacing: '0.42em',
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
