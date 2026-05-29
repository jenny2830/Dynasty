import { SupabaseClient } from '@supabase/supabase-js'
import { FREE_TRIAL_MAX_SESSIONS } from './plans'

export async function trackSession(supabase: SupabaseClient, userId: string) {
  const { data: landlord } = await supabase
    .from('landlords')
    .select('id, plan, sessions_used, free_trial_expired')
    .eq('auth_user_id', userId)
    .maybeSingle()

  if (!landlord) return null
  if (landlord.plan !== 'free') return landlord
  if (landlord.free_trial_expired) return landlord

  const newCount = (landlord.sessions_used || 0) + 1
  const isExpired = newCount >= FREE_TRIAL_MAX_SESSIONS

  await supabase
    .from('landlords')
    .update({ sessions_used: newCount, free_trial_expired: isExpired })
    .eq('id', landlord.id)

  return { ...landlord, sessions_used: newCount, free_trial_expired: isExpired }
}

export function isTrialActive(landlord: {
  plan: string
  sessions_used: number
  free_trial_expired: boolean
}): boolean {
  if (landlord.plan !== 'free') return false
  return !landlord.free_trial_expired && landlord.sessions_used < FREE_TRIAL_MAX_SESSIONS
}
