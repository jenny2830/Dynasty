'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard,
  Building2,
  ArrowLeftRight,
  RefreshCw,
  ScanLine,
  BarChart3,
  TrendingUp,
  Settings,
  Crown,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from './ThemeToggle'

const NAV_PRIMARY = [
  { href: '/overview',     label: 'Overview',      Icon: LayoutDashboard },
  { href: '/properties',   label: 'Properties',    Icon: Building2 },
  { href: '/transactions', label: 'Transactions',  Icon: ArrowLeftRight },
  { href: '/recurring',    label: 'Recurring',     Icon: RefreshCw },
] as const

const NAV_INTELLIGENCE = [
  { href: '/receipts',     label: 'Receipts',      Icon: ScanLine },
  { href: '/reports',      label: 'Reports',       Icon: BarChart3 },
  { href: '/roi',          label: 'ROI',           Icon: TrendingUp },
] as const

const NAV_ACCOUNT = [
  { href: '/settings',     label: 'Settings',      Icon: Settings },
  { href: '/upgrade',      label: 'Upgrade',       Icon: Crown,    gold: true },
] as const

interface SidebarColors {
  bg: string
  border: string
  logoBorder: string
  tagline: string
  hatch: string
  sectionLabel: string
  navText: string
  navActive: string
  navActiveBg: string
  navActiveBorder: string
  hover: string
  divider: string
  footer: string
  footerDiamond: string
  closeBtnBorder: string
  hamburgerBg: string
  hamburgerBorder: string
  hamburgerColor: string
}

interface NavItemProps {
  href: string
  label: string
  Icon: React.ComponentType<{ style?: React.CSSProperties; strokeWidth?: number }>
  isActive: boolean
  gold?: boolean
  onNavigate?: () => void
  colors: SidebarColors
}

function NavItem({ href, label, Icon, isActive, gold, onNavigate, colors }: NavItemProps) {
  const defaultColor = gold ? '#C9A84C' : colors.navText
  return (
    <Link
      href={href}
      prefetch={true}
      onClick={onNavigate}
      style={isActive ? {
        color: colors.navActive,
        fontFamily: "'Jost', sans-serif",
        fontSize: '11px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        padding: '11px 20px 11px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderLeft: `2px solid ${colors.navActiveBorder}`,
        background: colors.navActiveBg,
        textDecoration: 'none',
        transition: 'color 0.2s ease',
      } : {
        color: defaultColor,
        fontFamily: "'Jost', sans-serif",
        fontSize: '11px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        padding: '11px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'color 0.2s ease',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        if (!isActive) (e.currentTarget as HTMLElement).style.color = colors.hover
      }}
      onMouseLeave={e => {
        if (!isActive) (e.currentTarget as HTMLElement).style.color = defaultColor
      }}
    >
      <Icon
        style={{ width: '15px', height: '15px', flexShrink: 0 }}
        strokeWidth={1.2}
      />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    </Link>
  )
}

function NavSectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <p style={{
      color,
      fontFamily: "'Jost', sans-serif",
      fontSize: '8px',
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      padding: '20px 20px 6px',
      margin: 0,
    }}>
      {children}
    </p>
  )
}

interface SidebarProps {
  userId?: string
  initialTheme?: string
}

function buildColors(resolvedTheme: string | undefined, mounted: boolean): SidebarColors {
  const isDark = !mounted || resolvedTheme === 'dark'
  const isRose = mounted && resolvedTheme === 'rose'

  if (isDark) {
    return {
      bg: '#080808',
      border: 'rgba(201,168,76,0.12)',
      logoBorder: 'rgba(201,168,76,0.15)',
      tagline: 'rgba(201,168,76,0.45)',
      hatch: 'repeating-linear-gradient(45deg, transparent, transparent 28px, rgba(201,168,76,0.018) 28px, rgba(201,168,76,0.018) 29px), repeating-linear-gradient(-45deg, transparent, transparent 28px, rgba(201,168,76,0.018) 28px, rgba(201,168,76,0.018) 29px)',
      sectionLabel: '#6B6B65',
      navText: '#9A8F7A',
      navActive: '#C9A84C',
      navActiveBg: 'rgba(201,168,76,0.07)',
      navActiveBorder: '#C9A84C',
      hover: '#B76E79',
      divider: 'rgba(201,168,76,0.08)',
      footer: 'rgba(201,168,76,0.30)',
      footerDiamond: 'rgba(201,168,76,0.50)',
      closeBtnBorder: 'rgba(201,168,76,0.20)',
      hamburgerBg: 'rgba(8,8,8,0.85)',
      hamburgerBorder: 'rgba(201,168,76,0.30)',
      hamburgerColor: '#C9A84C',
    }
  }

  if (isRose) {
    return {
      bg: '#F8EDE9',
      border: 'rgba(183,110,121,0.20)',
      logoBorder: 'rgba(183,110,121,0.18)',
      tagline: 'rgba(183,110,121,0.50)',
      hatch: 'none',
      sectionLabel: '#B39A9E',
      navText: '#7A5A60',
      navActive: '#B76E79',
      navActiveBg: 'rgba(183,110,121,0.10)',
      navActiveBorder: '#B76E79',
      hover: '#C9A84C',
      divider: 'rgba(183,110,121,0.10)',
      footer: 'rgba(183,110,121,0.35)',
      footerDiamond: 'rgba(183,110,121,0.55)',
      closeBtnBorder: 'rgba(183,110,121,0.22)',
      hamburgerBg: 'rgba(248,237,233,0.92)',
      hamburgerBorder: 'rgba(183,110,121,0.35)',
      hamburgerColor: '#D4959E',
    }
  }

  // Light
  return {
    bg: '#F0EBE3',
    border: 'rgba(154,122,46,0.18)',
    logoBorder: 'rgba(154,122,46,0.18)',
    tagline: 'rgba(154,122,46,0.50)',
    hatch: 'none',
    sectionLabel: '#8A8A82',
    navText: '#5C5548',
    navActive: '#9A7A2E',
    navActiveBg: 'rgba(154,122,46,0.08)',
    navActiveBorder: '#9A7A2E',
    hover: '#9A7A2E',
    divider: 'rgba(154,122,46,0.12)',
    footer: 'rgba(154,122,46,0.40)',
    footerDiamond: 'rgba(154,122,46,0.50)',
    closeBtnBorder: 'rgba(154,122,46,0.22)',
    hamburgerBg: 'rgba(245,240,232,0.92)',
    hamburgerBorder: 'rgba(154,122,46,0.30)',
    hamburgerColor: '#6B6B65',
  }
}

export function Sidebar({ userId }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isPhoneLandscape, setIsPhoneLandscape] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const mqMobile = window.matchMedia('(max-width: 768px)')
    // Phone landscape: wide but short — height ≤ 500px catches phones in landscape
    // while leaving tablets (taller in landscape) unaffected.
    const mqLandscape = window.matchMedia('(orientation: landscape) and (max-height: 500px)')

    const update = () => {
      setIsMobile(mqMobile.matches)
      setIsPhoneLandscape(mqLandscape.matches)
    }
    update()
    mqMobile.addEventListener('change', update)
    mqLandscape.addEventListener('change', update)
    return () => {
      mqMobile.removeEventListener('change', update)
      mqLandscape.removeEventListener('change', update)
    }
  }, [])

  // Close the drawer whenever the route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    if (isMobile && isOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [isMobile, isOpen])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const closeDrawer = () => setIsOpen(false)

  const compact = isPhoneLandscape
  const colors = buildColors(resolvedTheme, mounted)

  const asideBaseStyle: React.CSSProperties = {
    backgroundColor: colors.bg,
    borderRight: `1px solid ${colors.border}`,
    backgroundImage: colors.hatch,
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
  }

  const inner = (
    <div style={{ position: 'relative', display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0 }}>
      {/* Logo area */}
      <div style={{
        padding: compact ? '8px 20px 8px' : '16px 20px 12px',
        borderBottom: `1px solid ${colors.logoBorder}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/dynastynobg.png"
            alt="Dynasty"
            style={{ height: compact ? '60px' : '190px', width: '100%', objectFit: 'contain', display: 'block', margin: '0 auto', padding: compact ? '4px 12px' : '8px 12px' }}
          />
        </div>
        <p style={{
          color: colors.tagline,
          fontFamily: "'Jost', sans-serif",
          fontSize: '8px',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          textAlign: 'center',
          margin: '8px 0 0 0',
        }}>
          Property Wealth Platform
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flex: 1, flexDirection: 'column', overflowY: 'auto', paddingTop: '8px', paddingBottom: '12px' }}>
        <NavSectionLabel color={colors.sectionLabel}>Portfolio</NavSectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {NAV_PRIMARY.map((item) => (
            <NavItem key={item.href} {...item} isActive={isActive(item.href)} onNavigate={closeDrawer} colors={colors} />
          ))}
        </div>

        <NavSectionLabel color={colors.sectionLabel}>Intelligence</NavSectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {NAV_INTELLIGENCE.map((item) => (
            <NavItem key={item.href} {...item} isActive={isActive(item.href)} onNavigate={closeDrawer} colors={colors} />
          ))}
        </div>

        <div style={{ margin: '12px 20px', height: '1px', background: colors.divider }} />

        <NavSectionLabel color={colors.sectionLabel}>Account</NavSectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {NAV_ACCOUNT.map((item) => (
            <NavItem key={item.href} {...item} isActive={isActive(item.href)} gold={'gold' in item ? item.gold : false} onNavigate={closeDrawer} colors={colors} />
          ))}
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 20px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: colors.navText,
              fontFamily: "'Jost', sans-serif",
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textAlign: 'left',
              width: '100%',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = colors.hover)}
            onMouseLeave={e => (e.currentTarget.style.color = colors.navText)}
          >
            <LogOut style={{ width: '15px', height: '15px', flexShrink: 0 }} strokeWidth={1.2} />
            <span>Sign Out</span>
          </button>

          <div style={{ margin: '8px 20px', height: '1px', background: colors.divider }} />
          <ThemeToggle />
        </div>
      </nav>

      {/* Footer mark */}
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${colors.divider}` }}>
        <p style={{
          textTransform: 'uppercase',
          textAlign: 'center',
          fontFamily: "'Jost', sans-serif",
          fontWeight: 300,
          fontSize: '7px',
          letterSpacing: '0.35em',
          color: colors.footer,
          margin: 0,
        }}>
          <span style={{ display: 'inline-block', marginRight: '8px', color: colors.footerDiamond }}>◆</span>
          Legacy · Luxury · Timeless
          <span style={{ display: 'inline-block', marginLeft: '8px', color: colors.footerDiamond }}>◆</span>
        </p>
      </div>
    </div>
  )

  // Desktop OR phone landscape: persistent sticky sidebar alongside main content.
  // Phone portrait (isMobile && !isPhoneLandscape): hamburger + drawer.
  if (!mounted || !isMobile || isPhoneLandscape) {
    return (
      <aside className="dashboard-sidebar" style={{
        ...asideBaseStyle,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '240px',
        flexShrink: 0,
        height: '100vh',
        overflowY: 'auto',
      }}>
        {inner}
      </aside>
    )
  }

  // Mobile portrait: hamburger toggle + slide-in drawer + backdrop.
  return (
    <>
      <button
        type="button"
        aria-label="Open navigation menu"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          top: '14px',
          left: '14px',
          zIndex: 100,
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.hamburgerBg,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          border: `1px solid ${colors.hamburgerBorder}`,
          borderRadius: '2px',
          color: colors.hamburgerColor,
          cursor: 'pointer',
        }}
      >
        <Menu style={{ width: '18px', height: '18px' }} strokeWidth={1.4} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={closeDrawer}
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 998,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Drawer */}
      <aside className="dashboard-sidebar" style={{
        ...asideBaseStyle,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 999,
        width: '240px',
        maxWidth: '82vw',
        height: '100vh',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease, border-color 0.3s ease',
        boxShadow: isOpen ? '8px 0 32px rgba(0,0,0,0.6)' : 'none',
      }}>
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeDrawer}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 1,
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: `1px solid ${colors.closeBtnBorder}`,
            borderRadius: '2px',
            color: colors.navText,
            cursor: 'pointer',
          }}
        >
          <X style={{ width: '16px', height: '16px' }} strokeWidth={1.4} />
        </button>
        {inner}
      </aside>
    </>
  )
}
