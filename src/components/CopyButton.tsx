'use client'

import { useState } from 'react'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: copied ? 'var(--gold)' : 'rgba(245,237,224,0.3)',
        padding: '2px 0',
        fontFamily: 'var(--font-dm-mono)',
        fontSize: '8px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        transition: 'color 150ms',
        flexShrink: 0,
      }}
    >
      {copied ? (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2,6.5 5,9.5 11,3.5" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4.5" y="2.5" width="7" height="9" rx="1" />
          <path d="M4.5 4.5H2.5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2" />
        </svg>
      )}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
