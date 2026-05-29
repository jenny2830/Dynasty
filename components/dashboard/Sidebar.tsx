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
] as const

interface NavItemProps {
  href: string
  label: string
  Icon: React.ComponentType<{ style?: React.CSSProperties; strokeWidth?: number }>
  isActive: boolean
  onNavigate?: () => void
}

function NavItem({ href, label, Icon, isActive, onNavigate }: NavItemProps) {
  return (
    <Link
      href={href}
      prefetch={true}
      onClick={onNavigate}
      style={isActive ? {
        color: '#C9A84C',
        fontFamily: "'Jost', sans-serif",
        fontSize: '11px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        padding: '11px 20px 11px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderLeft: '2px solid #C9A84C',
        background: 'rgba(201,168,76,0.07)',
        textDecoration: 'none',
        transition: 'color 0.2s ease',
      } : {
        color: '#9A8F7A',
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
        if (!isActive) (e.currentTarget as HTMLElement).style.color = '#B76E79'
      }}
      onMouseLeave={e => {
        if (!isActive) (e.currentTarget as HTMLElement).style.color = '#9A8F7A'
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
      color: '#6B6B65',
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
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
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

  const inner = (
    <div style={{ position: 'relative', display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0 }}>
      {/* Logo area */}
      <div style={{
        padding: '16px 20px 12px',
        borderBottom: '1px solid rgba(201,168,76,0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/dynasty_logo.jpg"
            alt="Dynasty"
            style={{ height: '190px', width: '100%', objectFit: 'contain', display: 'block', margin: '0 auto', padding: '8px 12px' }}
          />
        </div>
        <p style={{
          color: 'rgba(201,168,76,0.45)',
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

        <div style={{ margin: '12px 20px', height: '1px', background: 'rgba(201,168,76,0.08)' }} />

        <NavSectionLabel>Account</NavSectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {NAV_ACCOUNT.map((item) => (
            <NavItem key={item.href} {...item} isActive={isActive(item.href)} onNavigate={closeDrawer} />
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
              color: '#9A8F7A',
              fontFamily: "'Jost', sans-serif",
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textAlign: 'left',
              width: '100%',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#B76E79')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9A8F7A')}
          >
            <LogOut style={{ width: '15px', height: '15px', flexShrink: 0 }} strokeWidth={1.2} />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Footer mark */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(201,168,76,0.08)' }}>
        <p style={{
          textTransform: 'uppercase',
          textAlign: 'center',
          fontFamily: "'Jost', sans-serif",
          fontWeight: 300,
          fontSize: '7px',
          letterSpacing: '0.35em',
          color: 'rgba(201,168,76,0.3)',
          margin: 0,
        }}>
          <span style={{ display: 'inline-block', marginRight: '8px', color: 'rgba(201,168,76,0.5)' }}>◆</span>
          Legacy · Luxury · Timeless
          <span style={{ display: 'inline-block', marginLeft: '8px', color: 'rgba(201,168,76,0.5)' }}>◆</span>
        </p>
      </div>
    </div>
  )

  const decoBackground = 'repeating-linear-gradient(45deg, transparent, transparent 28px, rgba(201,168,76,0.018) 28px, rgba(201,168,76,0.018) 29px), repeating-linear-gradient(-45deg, transparent, transparent 28px, rgba(201,168,76,0.018) 28px, rgba(201,168,76,0.018) 29px)'

  // Desktop (and the very first client render before we know the viewport):
  // keep the existing sticky 240px sidebar exactly as-is.
  if (!mounted || !isMobile) {
    return (
      <aside style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '240px',
        flexShrink: 0,
        height: '100vh',
        backgroundColor: '#080808',
        borderRight: '1px solid rgba(201,168,76,0.12)',
        backgroundImage: decoBackground,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {inner}
      </aside>
    )
  }

  // Mobile: hamburger toggle + slide-in drawer + backdrop.
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
          background: 'rgba(8,8,8,0.85)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: '2px',
          color: '#C9A84C',
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
      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 999,
        width: '240px',
        maxWidth: '82vw',
        height: '100vh',
        backgroundColor: '#080808',
        borderRight: '1px solid rgba(201,168,76,0.12)',
        backgroundImage: decoBackground,
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
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '2px',
            color: '#9A8F7A',
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
