'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

/**
 * Applies persisted preferences (text size, color palette) to the document
 * root on load so choices made in Settings take effect on every dashboard page.
 */
export function PreferencesInit() {
  const { setTheme } = useTheme()

  useEffect(() => {
    const size = localStorage.getItem('dynasty-text-size')
    if (size === 'sm' || size === 'md' || size === 'lg') {
      document.documentElement.dataset.textSize = size
    }

    const palette = localStorage.getItem('dynasty-color-palette')
    if (palette === 'black-gold' || palette === 'white-black') {
      document.documentElement.dataset.colorPalette = palette
      setTheme(palette === 'white-black' ? 'light' : 'dark')
    } else {
      // Default to dark theme
      document.documentElement.dataset.colorPalette = 'black-gold'
      localStorage.setItem('dynasty-color-palette', 'black-gold')
      setTheme('dark')
    }
  }, [setTheme])

  return null
}
