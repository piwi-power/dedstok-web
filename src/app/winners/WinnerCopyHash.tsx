'use client'

import { useState } from 'react'

export default function WinnerCopyHash({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false)

  const short = hash.slice(0, 12) + '...' + hash.slice(-8)

  async function copy() {
    try {
      await navigator.clipboard.writeText(hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
      <div style={{
        background: 'rgba(245,237,224,0.03)',
        border: '1px solid rgba(245,237,224,0.06)',
        padding: '10px 14px',
        flex: 1,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'var(--font-dm-mono)',
            color: 'rgba(245,237,224,0.3)',
            fontSize: '8px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            SHA-256
          </p>
          <p style={{
            fontFamily: 'var(--font-dm-mono)',
            color: 'rgba(245,237,224,0.45)',
            fontSize: '10px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {short}
          </p>
        </div>
        <button
          onClick={copy}
          style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '8px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: copied ? 'var(--gold)' : 'rgba(245,237,224,0.25)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            flexShrink: 0,
            transition: 'color 0.15s ease',
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
