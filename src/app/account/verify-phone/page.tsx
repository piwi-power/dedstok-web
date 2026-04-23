export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VerifyPhoneClient from './VerifyPhoneClient'

export const metadata: Metadata = {
  title: 'Verify Phone — DEDSTOK',
}

interface Props {
  searchParams: Promise<{ return?: string }>
}

export default async function VerifyPhonePage({ searchParams }: Props) {
  const { return: returnTo } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userRecord } = await supabase
    .from('users')
    .select('phone_verified')
    .eq('id', user.id)
    .single()

  if (userRecord?.phone_verified) {
    redirect(returnTo ?? '/account')
  }

  return <VerifyPhoneClient returnTo={returnTo ?? '/account'} />
}
