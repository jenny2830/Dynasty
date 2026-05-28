'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
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
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
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
] as const

interface NavItemProps {
  href: string
  label: string
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  isActive: boolean
}

function NavItem({ href, label, Icon, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'relative flex items-center gap-3 py-[11px] uppercase',
        'font-sans font-light text-[11px] tracking-[0.14em]',
        'transition-colors duration-200',
        isActive
          ? 'text-dynasty-gold bg-[rgba(201,168,76,0.07)] pl-[18px] pr-5 border-l-2 border-dynasty-gold'
          : 'text-dynasty-gray-500 px-5 hover:text-dynasty-gold hover:bg-[rgba(201,168,76,0.04)]'
      )}
    >
      <Icon
        className="h-[15px] w-[15px] shrink-0"
        strokeWidth={1.2}
      />
      <span className="truncate">{label}</span>
    </Link>
  )
}

function NavSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className={cn(
        'px-5 pt-5 pb-1.5 uppercase',
        'font-sans font-light text-[8px] tracking-[0.22em]',
        'text-dynasty-gray-600'
      )}
    >
      {children}
    </p>
  )
}

interface SidebarProps {
  userId?: string
  initialTheme?: string
}

export function Sidebar({ userId, initialTheme }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme } = useTheme()

  useEffect(() => {
    if (initialTheme) {
      setTheme(initialTheme)
    }
  }, [initialTheme, setTheme])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-60 flex-col',
        'bg-dynasty-black border-r border-[rgba(201,168,76,0.12)]',
        'deco-hatching'
      )}
    >
      <div className="relative flex flex-1 flex-col">
        {/* Logo area */}
        <div
          className={cn(
            'px-5 pt-6 pb-5 border-b border-[rgba(201,168,76,0.15)]',
            'flex flex-col items-center'
          )}
        >
          <div className="flex items-center justify-center py-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/dynasty_logo.jpg"
              alt="Dynasty"
              style={{ height: '72px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
            />
          </div>
          <p
            className={cn(
              'mt-3 uppercase text-center',
              'font-sans font-light text-[8px] tracking-[0.25em]',
              'text-[rgba(201,168,76,0.4)]'
            )}
          >
            Property Wealth Platform
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col overflow-y-auto pt-2 pb-3">
          <NavSectionLabel>Portfolio</NavSectionLabel>
          <div className="flex flex-col">
            {NAV_PRIMARY.map((item) => (
              <NavItem key={item.href} {...item} isActive={isActive(item.href)} />
            ))}
          </div>

          <NavSectionLabel>Intelligence</NavSectionLabel>
          <div className="flex flex-col">
            {NAV_INTELLIGENCE.map((item) => (
              <NavItem key={item.href} {...item} isActive={isActive(item.href)} />
            ))}
          </div>

          <div className="mx-5 my-3 h-px bg-[rgba(201,168,76,0.08)]" />

          <NavSectionLabel>Account</NavSectionLabel>
          <div className="flex flex-col">
            <ThemeToggle />
            {NAV_ACCOUNT.map((item) => (
              <NavItem key={item.href} {...item} isActive={isActive(item.href)} />
            ))}
            <button
              onClick={handleSignOut}
              className={cn(
                'flex items-center gap-3 px-5 py-[11px] uppercase text-left',
                'font-sans font-light text-[11px] tracking-[0.14em]',
                'text-dynasty-gray-500 transition-colors duration-200',
                'hover:text-dynasty-rose-gold hover:bg-[rgba(183,110,121,0.04)]'
              )}
            >
              <LogOut className="h-[15px] w-[15px] shrink-0" strokeWidth={1.2} />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>

        {/* Footer mark */}
        <div className="px-5 py-4 border-t border-[rgba(201,168,76,0.08)]">
          <p
            className={cn(
              'uppercase text-center',
              'font-sans font-light text-[7px] tracking-[0.35em]',
              'text-[rgba(201,168,76,0.3)]'
            )}
          >
            <span className="inline-block mr-2 text-[rgba(201,168,76,0.5)]">◆</span>
            Legacy · Luxury · Timeless
            <span className="inline-block ml-2 text-[rgba(201,168,76,0.5)]">◆</span>
          </p>
        </div>
      </div>
    </aside>
  )
}
