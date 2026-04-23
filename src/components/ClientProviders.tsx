'use client'

import dynamic from 'next/dynamic'
import InkTransitionProvider from './InkTransitionProvider'

// ssr: false requires a Client Component — cannot live in layout.tsx (Server Component)
const PagePreloader = dynamic(() => import('./PagePreloader'), { ssr: false })

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <InkTransitionProvider>
      {children}
      <PagePreloader />
    </InkTransitionProvider>
  )
}
