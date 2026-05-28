import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Save a single landlords table preference to Supabase.
 * Replaces any localStorage/sessionStorage usage — all user state lives here.
 */
export async function savePreference(
  supabase: SupabaseClient,
  userId: string,
  key: string,
  value: unknown
) {
  await supabase
    .from('landlords')
    .update({ [key]: value })
    .eq('auth_user_id', userId)
}

/**
 * Save theme preference to Supabase landlords table.
 */
export async function saveThemePreference(
  supabase: SupabaseClient,
  userId: string,
  theme: 'dark' | 'light'
) {
  return savePreference(supabase, userId, 'theme_preference', theme)
}
