'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
}

function NavItem({ href, label, Icon, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      prefetch={true}
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

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

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
      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 28px, rgba(201,168,76,0.018) 28px, rgba(201,168,76,0.018) 29px), repeating-linear-gradient(-45deg, transparent, transparent 28px, rgba(201,168,76,0.018) 28px, rgba(201,168,76,0.018) 29px)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ position: 'relative', display: 'flex', flex: 1, flexDirection: 'column' }}>
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
              <NavItem key={item.href} {...item} isActive={isActive(item.href)} />
            ))}
          </div>

          <NavSectionLabel>Intelligence</NavSectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {NAV_INTELLIGENCE.map((item) => (
              <NavItem key={item.href} {...item} isActive={isActive(item.href)} />
            ))}
          </div>

          <div style={{ margin: '12px 20px', height: '1px', background: 'rgba(201,168,76,0.08)' }} />

          <NavSectionLabel>Account</NavSectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {NAV_ACCOUNT.map((item) => (
              <NavItem key={item.href} {...item} isActive={isActive(item.href)} />
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
    </aside>
  )
}
