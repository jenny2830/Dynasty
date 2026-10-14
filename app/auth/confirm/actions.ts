'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type ConfirmType, isConfirmType, defaultNextFor, safeNextPath } from './shared'

export interface ConfirmState {
  error: string | null
}

export async function confirmToken(_prev: ConfirmState, formData: FormData): Promise<ConfirmState> {
  const tokenHash = formData.get('token_hash')
  const type = formData.get('type')
  const next = formData.get('next')

  if (typeof tokenHash !== 'string' || !tokenHash || !isConfirmType(type)) {
    return { error: 'This link is invalid or incomplete.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as ConfirmType })

  if (error) {
    return { error: error.message }
  }

  redirect(safeNextPath(next, defaultNextFor(type)))
}
