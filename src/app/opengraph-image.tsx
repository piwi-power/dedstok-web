import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'DEDSTOK — One Drop. One Winner. Every Week.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
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
        {/* Gold accent line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: '#ca8a04',
        }} />

        {/* Wordmark */}
        <div style={{
          color: '#ca8a04',
          fontSize: 96,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontFamily: 'serif',
          lineHeight: 1,
          marginBottom: 24,
        }}>
          DEDSTOK
        </div>

        {/* Divider */}
        <div style={{
          width: 40,
          height: 1,
          background: 'rgba(202,138,4,0.4)',
          marginBottom: 24,
        }} />

        {/* Tagline */}
        <div style={{
          color: 'rgba(245,237,224,0.45)',
          fontSize: 20,
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
        }}>
          One Drop. One Winner. Every Week.
        </div>

        {/* Bottom accent line */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: '#ca8a04',
        }} />
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
