'use client'

import { useEffect } from 'react'

/**
 * Applies persisted preferences (text size) to the document root on load.
 * Theme is now handled by AppThemeProvider via Supabase persistence.
 */
export function PreferencesInit() {
  useEffect(() => {
    const size = localStorage.getItem('dynasty-text-size')
    if (size === 'sm' || size === 'md' || size === 'lg') {
      document.documentElement.dataset.textSize = size
    }
  }, [])

  return null
}
