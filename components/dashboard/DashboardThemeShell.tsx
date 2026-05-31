'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface DashboardThemeShellProps {
  sidebar: React.ReactNode
  children: React.ReactNode
}

export function DashboardThemeShell({ sidebar, children }: DashboardThemeShellProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const isDark = !mounted || resolvedTheme === 'dark'
  const isRose = mounted && resolvedTheme === 'rose'

  const shellBg = isDark ? '#080808' : isRose ? '#FDF8F6' : '#FAF7F2'
  const mainBg  = isDark ? '#0A0A0A' : isRose ? '#FDF8F6' : '#FAF7F2'
  const mainTexture = isDark
    ? 'repeating-linear-gradient(45deg, transparent, transparent 60px, rgba(201,168,76,0.008) 60px, rgba(201,168,76,0.008) 61px), repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(201,168,76,0.008) 60px, rgba(201,168,76,0.008) 61px)'
    : 'none'

  return (
    <div
      className="dashboard-landscape-shell"
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: shellBg,
        transition: 'background-color 0.3s ease',
      }}
    >
      {sidebar}
      <main
        className="dashboard-main"
        style={{
          flex: 1,
          minWidth: 0,
          backgroundColor: mainBg,
          backgroundImage: mainTexture,
          position: 'relative',
          transition: 'background-color 0.3s ease',
        }}
      >
        {children}
      </main>
    </div>
  )
}
