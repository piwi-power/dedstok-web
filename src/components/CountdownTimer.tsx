'use client'

import { useState, useEffect } from 'react'

interface Props {
  drawDate: string
}

function getTimeLeft(drawDate: string) {
  const diff = new Date(drawDate).getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

export default function CountdownTimer({ drawDate }: Props) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(drawDate))

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(drawDate)), 1000)
    return () => clearInterval(interval)
  }, [drawDate])

  const units = timeLeft
    ? [
        { label: 'Days', value: timeLeft.days },
        { label: 'Hrs',  value: timeLeft.hours },
        { label: 'Min',  value: timeLeft.minutes },
        { label: 'Sec',  value: timeLeft.seconds },
      ]
    : null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <p style={{
        fontFamily: 'var(--font-dm-mono)',
        color: 'rgba(245,237,224,0.25)',
        fontSize: '9px',
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}>
        {units ? 'Draw in' : 'Draw complete'}
      </p>

      {units && (
        <div style={{ display: 'flex', border: '1px solid rgba(202,138,4,0.15)' }}>
          {units.map((unit, i) => (
            <div
              key={unit.label}
              style={{
                padding: '8px 14px',
                borderRight: i < units.length - 1 ? '1px solid rgba(202,138,4,0.1)' : 'none',
                textAlign: 'center',
                minWidth: '48px',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-bebas)',
                color: 'var(--cream)',
                fontSize: '22px',
                lineHeight: 1,
              }}>
                {String(unit.value).padStart(2, '0')}
              </p>
              <p style={{
                fontFamily: 'var(--font-dm-mono)',
                color: 'rgba(245,237,224,0.25)',
                fontSize: '7px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginTop: '3px',
              }}>
                {unit.label}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
