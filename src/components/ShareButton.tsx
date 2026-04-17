'use client'

import { useState } from 'react'

interface Props {
  title: string
  text?: string
  url: string
}

export default function ShareButton({ title, text, url }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    // Native share sheet (mobile)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch {
        // user cancelled — do nothing
      }
      return
    }

    // Desktop fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement('input')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        fontFamily: 'var(--font-dm-mono)',
        fontSize: '9px',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: copied ? 'var(--gold)' : 'rgba(245,237,224,0.4)',
        background: 'none',
        border: `1px solid ${copied ? 'rgba(202,138,4,0.4)' : 'rgba(245,237,224,0.12)'}`,
        padding: '10px 16px',
        cursor: 'pointer',
        transition: 'color 150ms, border-color 150ms',
      }}
      onMouseEnter={e => {
        if (!copied) {
          e.currentTarget.style.color = 'rgba(245,237,224,0.7)'
          e.currentTarget.style.borderColor = 'rgba(245,237,224,0.25)'
        }
      }}
      onMouseLeave={e => {
        if (!copied) {
          e.currentTarget.style.color = 'rgba(245,237,224,0.4)'
          e.currentTarget.style.borderColor = 'rgba(245,237,224,0.12)'
        }
      }}
    >
      {copied ? (
        <>
          {/* Checkmark */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2,6 4.5,8.5 10,3" />
          </svg>
          Link Copied
        </>
      ) : (
        <>
          {/* Share icon */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9.5" cy="2" r="1.5" />
            <circle cx="2" cy="6" r="1.5" />
            <circle cx="9.5" cy="10" r="1.5" />
            <line x1="3.4" y1="6.8" x2="8.1" y2="9.2" />
            <line x1="8.1" y1="2.8" x2="3.4" y2="5.2" />
          </svg>
          Share
        </>
      )}
    </button>
  )
}
