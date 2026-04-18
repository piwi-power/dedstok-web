// Homepage — The Room Experience
// Server component: reads auth state, passes to client navigator.
// The room navigator handles all interaction and transitions.

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import RoomNavigator from '@/components/rooms/RoomNavigator'

export const metadata = {
  title: 'DEDSTOK — One Drop. One Winner. Every Week.',
  description: 'A weekly raffle for curated streetwear grails. One item, one winner, pure luck.',
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    // No padding-top here — the room fills the full viewport including behind the nav.
    // The nav's transparent mode on the homepage means it floats over the room image.
    <div style={{ position: 'fixed', inset: 0 }}>
      <Suspense fallback={null}>
        <RoomNavigator
          isAuthenticated={!!user}
          userEmail={user?.email}
        />
      </Suspense>
    </div>
  )
}
