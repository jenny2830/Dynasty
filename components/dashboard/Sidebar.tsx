'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAppTheme } from '@/lib/theme-context'
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

interface NavItemProps {
  href: string
  label: string
  Icon: React.ComponentType<{ style?: React.CSSProperties; strokeWidth?: number }>
  isActive: boolean
  gold?: boolean
  onNavigate?: () => void
  navText: string
  navActive: string
  navActiveBg: string
  navActiveBorder: string
  accentColor: string
}

function NavItem({ href, label, Icon, isActive, gold, onNavigate, navText, navActive, navActiveBg, navActiveBorder, accentColor }: NavItemProps) {
  const { fontWeights } = useAppTheme()
  const defaultColor = gold ? accentColor : navText
  return (
    <Link
      href={href}
      prefetch={true}
      onClick={onNavigate}
      style={isActive ? {
        color: navActive,
        fontFamily: "'Jost', sans-serif",
        fontWeight: fontWeights.medium,
        fontSize: '12px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        padding: '11px 20px 11px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderLeft: `2px solid ${navActiveBorder}`,
        background: navActiveBg,
        textDecoration: 'none',
        transition: 'color 0.2s ease',
      } : {
        color: defaultColor,
        fontFamily: "'Jost', sans-serif",
        fontWeight: fontWeights.body,
        fontSize: '12px',
        letterSpacing: '0.12em',
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
        if (!isActive) (e.currentTarget as HTMLElement).style.color = navActive
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
  const { fontWeights } = useAppTheme()
  return (
    <p style={{
      color,
      fontFamily: "'Jost', sans-serif",
      fontWeight: fontWeights.body,
      fontSize: '10px',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      padding: '20px 20px 8px',
      margin: 0,
      display: 'block',
      position: 'relative',
      zIndex: 2,
      opacity: 1,
      overflow: 'visible',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </p>
  )
}

interface SidebarProps {
  userId?: string
}

export function Sidebar({ userId }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, fontWeights } = useAppTheme()
  const [isMobile, setIsMobile] = useState(false)
  const [isPhoneLandscape, setIsPhoneLandscape] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const mqMobile = window.matchMedia('(max-width: 768px)')
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

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

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

  const asideBaseStyle: React.CSSProperties = {
    backgroundColor: theme.sidebarBg,
    borderRight: theme.sidebarBorder,
    backgroundImage: theme.sidebarHatch === 'none' ? undefined : theme.sidebarHatch,
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
  }

  const inner = (
    <div style={{ position: 'relative', display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0 }}>
      {/* Logo area */}
      <div style={{
        padding: compact ? '8px 20px 8px' : '16px 20px 12px',
        borderBottom: theme.sidebarBorder,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/dynasty_logo.png"
            alt="Dynasty"
            style={{ height: compact ? '60px' : '190px', width: '100%', objectFit: 'contain', display: 'block', margin: '0 auto', padding: compact ? '4px 12px' : '8px 12px' }}
          />
        </div>
        <p style={{
          color: theme.tagline,
          fontFamily: "'Jost', sans-serif",
          fontSize: '10px',
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
        <NavSectionLabel color={theme.sectionLabel}>Portfolio</NavSectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {NAV_PRIMARY.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={isActive(item.href)}
              onNavigate={closeDrawer}
              navText={theme.navText}
              navActive={theme.navActive}
              navActiveBg={theme.navActiveBg}
              navActiveBorder={theme.navActiveBorder}
              accentColor={theme.accent}
            />
          ))}
        </div>

        <NavSectionLabel color={theme.sectionLabel}>Intelligence</NavSectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {NAV_INTELLIGENCE.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={isActive(item.href)}
              onNavigate={closeDrawer}
              navText={theme.navText}
              navActive={theme.navActive}
              navActiveBg={theme.navActiveBg}
              navActiveBorder={theme.navActiveBorder}
              accentColor={theme.accent}
            />
          ))}
        </div>

        <div style={{ margin: '12px 20px', height: '1px', background: theme.dividerColor }} />

        <NavSectionLabel color={theme.sectionLabel}>Account</NavSectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {NAV_ACCOUNT.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={isActive(item.href)}
              gold={'gold' in item ? item.gold : false}
              onNavigate={closeDrawer}
              navText={theme.navText}
              navActive={theme.navActive}
              navActiveBg={theme.navActiveBg}
              navActiveBorder={theme.navActiveBorder}
              accentColor={theme.accent}
            />
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
              color: theme.navText,
              fontFamily: "'Jost', sans-serif",
              fontWeight: fontWeights.body,
              fontSize: '12px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textAlign: 'left',
              width: '100%',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = theme.navActive)}
            onMouseLeave={e => (e.currentTarget.style.color = theme.navText)}
          >
            <LogOut style={{ width: '15px', height: '15px', flexShrink: 0 }} strokeWidth={1.2} />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Footer mark */}
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${theme.dividerColor}` }}>
        <p style={{
          textTransform: 'uppercase',
          textAlign: 'center',
          fontFamily: "'Jost', sans-serif",
          fontWeight: fontWeights.body,
          fontSize: '9px',
          letterSpacing: '0.35em',
          color: theme.tagline,
          margin: 0,
        }}>
          <span style={{ display: 'inline-block', marginRight: '8px', color: theme.cornerMark }}>◆</span>
          Legacy · Luxury · Timeless
          <span style={{ display: 'inline-block', marginLeft: '8px', color: theme.cornerMark }}>◆</span>
        </p>
      </div>
    </div>
  )

  if (!isMobile || isPhoneLandscape) {
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
          background: theme.sidebarBg,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          border: theme.sidebarBorder,
          borderRadius: '2px',
          color: theme.navActive,
          cursor: 'pointer',
        }}
      >
        <Menu style={{ width: '18px', height: '18px' }} strokeWidth={1.4} />
      </button>

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
            border: theme.sidebarBorder,
            borderRadius: '2px',
            color: theme.navText,
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
