'use client'

import { useState } from 'react'

interface Props {
  code: string
}

export default function ReferralCopy({ code }: Props) {
  const [copied, setCopied] = useState(false)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dedstok.com'
  const referralUrl = `${siteUrl}/?ref=${code}`

  function copy() {
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <p style={{
        color: '#f5ede0',
        fontFamily: 'monospace',
        fontSize: '13px',
        background: 'rgba(245,237,224,0.06)',
        padding: '8px 12px',
        borderRadius: '4px',
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {referralUrl}
      </p>
      <button
        onClick={copy}
        style={{
          background: copied ? 'rgba(34,197,94,0.15)' : '#CA8A04',
          color: copied ? '#22c55e' : '#0c0a09',
          border: copied ? '1px solid rgba(34,197,94,0.3)' : 'none',
          borderRadius: '4px',
          padding: '8px 16px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {copied ? 'Copied' : 'Copy Link'}
      </button>
    </div>
  )
}
