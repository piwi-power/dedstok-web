import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'DEDSTOK — One Drop. One Winner. Every Week.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  // Load Anton (the actual brand wordmark font)
  const antonFont = await fetch(
    'https://fonts.gstatic.com/s/anton/v25/1Ptgg87LROyAm3Kz-C8CSw.woff'
  ).then(r => r.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0c0a09',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Top gold bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#ca8a04', display: 'flex' }} />

        {/* Wordmark */}
        <div style={{
          color: '#ca8a04',
          fontSize: 148,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontFamily: 'Anton',
          lineHeight: 1,
          marginBottom: 36,
          display: 'flex',
        }}>
          DEDSTOK
        </div>

        {/* Divider */}
        <div style={{ width: 64, height: 2, background: 'rgba(202,138,4,0.45)', marginBottom: 36, display: 'flex' }} />

        {/* Tagline */}
        <div style={{
          color: 'rgba(245,237,224,0.42)',
          fontSize: 28,
          letterSpacing: '0.38em',
          textTransform: 'uppercase',
          fontFamily: 'Anton',
          display: 'flex',
        }}>
          One Drop. One Winner. Every Week.
        </div>

        {/* Bottom gold bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: '#ca8a04', display: 'flex' }} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Anton', data: antonFont, style: 'normal' }],
    }
  )
}
