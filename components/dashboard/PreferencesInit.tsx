'use client'

import { useEffect } from 'react'

/**
 * Applies the persisted text-size preference to the document root on load,
 * so the choice made in Settings affects every dashboard page.
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
