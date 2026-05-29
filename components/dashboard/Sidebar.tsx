'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
}

function NavItem({ href, label, Icon, isActive, gold, onNavigate }: NavItemProps) {
  const defaultColor = gold ? '#C9A84C' : 'var(--sidebar-muted-color)'
  return (
    <Link
      href={href}
      prefetch={true}
      onClick={onNavigate}
      style={isActive ? {
        color: 'var(--sidebar-active-color)',
        fontFamily: "'Jost', sans-serif",
        fontSize: '11px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        padding: '11px 20px 11px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderLeft: '2px solid var(--sidebar-active-border)',
        background: 'var(--sidebar-active-bg)',
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
        if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-hover-color)'
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

function NavSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      color: 'var(--sidebar-label-color)',
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

export function Sidebar({ userId }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
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

  const inner = (
    <div style={{ position: 'relative', display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0 }}>
      {/* Logo area */}
      <div style={{
        padding: compact ? '8px 20px 8px' : '16px 20px 12px',
        borderBottom: '1px solid var(--sidebar-logo-border)',
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
          color: 'var(--sidebar-tagline)',
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
        <NavSectionLabel>Portfolio</NavSectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {NAV_PRIMARY.map((item) => (
            <NavItem key={item.href} {...item} isActive={isActive(item.href)} onNavigate={closeDrawer} />
          ))}
        </div>

        <NavSectionLabel>Intelligence</NavSectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {NAV_INTELLIGENCE.map((item) => (
            <NavItem key={item.href} {...item} isActive={isActive(item.href)} onNavigate={closeDrawer} />
          ))}
        </div>

        <div style={{ margin: '12px 20px', height: '1px', background: 'var(--sidebar-divider)' }} />

        <NavSectionLabel>Account</NavSectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {NAV_ACCOUNT.map((item) => (
            <NavItem key={item.href} {...item} isActive={isActive(item.href)} gold={'gold' in item ? item.gold : false} onNavigate={closeDrawer} />
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
              color: 'var(--sidebar-muted-color)',
              fontFamily: "'Jost', sans-serif",
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textAlign: 'left',
              width: '100%',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--sidebar-hover-color)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--sidebar-muted-color)')}
          >
            <LogOut style={{ width: '15px', height: '15px', flexShrink: 0 }} strokeWidth={1.2} />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Footer mark */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--sidebar-divider)' }}>
        <p style={{
          textTransform: 'uppercase',
          textAlign: 'center',
          fontFamily: "'Jost', sans-serif",
          fontWeight: 300,
          fontSize: '7px',
          letterSpacing: '0.35em',
          color: 'var(--sidebar-footer-color)',
          margin: 0,
        }}>
          <span style={{ display: 'inline-block', marginRight: '8px', color: 'var(--sidebar-footer-diamond)' }}>◆</span>
          Legacy · Luxury · Timeless
          <span style={{ display: 'inline-block', marginLeft: '8px', color: 'var(--sidebar-footer-diamond)' }}>◆</span>
        </p>
      </div>
    </div>
  )

  // Desktop OR phone landscape: persistent sticky sidebar alongside main content.
  // Phone portrait (isMobile && !isPhoneLandscape): hamburger + drawer.
  if (!mounted || !isMobile || isPhoneLandscape) {
    return (
      <aside className="dashboard-sidebar" style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '240px',
        flexShrink: 0,
        height: '100vh',
        overflowY: 'auto',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        backgroundImage: 'var(--sidebar-deco)',
        display: 'flex',
        flexDirection: 'column',
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
          background: 'var(--sidebar-hamburger-bg)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          border: '1px solid var(--sidebar-hamburger-border)',
          borderRadius: '2px',
          color: 'var(--sidebar-hamburger-color)',
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
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 999,
        width: '240px',
        maxWidth: '82vw',
        height: '100vh',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        backgroundImage: 'var(--sidebar-deco)',
        display: 'flex',
        flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
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
            border: '1px solid var(--sidebar-close-btn-border)',
            borderRadius: '2px',
            color: 'var(--sidebar-muted-color)',
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
