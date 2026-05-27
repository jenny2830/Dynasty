'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  Crown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/',             label: 'Overview',     Icon: LayoutDashboard },
  { href: '/properties',  label: 'Properties',   Icon: Building2 },
  { href: '/transactions',label: 'Transactions', Icon: ArrowLeftRight },
  { href: '/recurring',   label: 'Recurring',    Icon: RefreshCw },
  { href: '/receipts',    label: 'Receipts',     Icon: ScanLine },
  { href: '/reports',     label: 'Reports',      Icon: BarChart3 },
  { href: '/roi',         label: 'ROI',          Icon: TrendingUp },
] as const

const BOTTOM_ITEMS = [
  { href: '/settings', label: 'Settings', Icon: Settings },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-dynasty-black border-r border-dynasty-gray-800">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-dynasty-gray-800 px-6">
        <Crown className="h-6 w-6 text-dynasty-gold" strokeWidth={1.5} />
        <span className="font-serif text-xl font-bold tracking-widest text-dynasty-gold">
          DYNASTY
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-dynasty-gold/10 text-dynasty-gold border border-dynasty-gold/20'
                  : 'text-dynasty-gray-400 hover:bg-dynasty-gray-800 hover:text-dynasty-cream'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  isActive ? 'text-dynasty-gold' : 'text-dynasty-gray-400'
                )}
                strokeWidth={1.5}
              />
              {label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-dynasty-gold" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom items */}
      <div className="border-t border-dynasty-gray-800 px-3 py-3 space-y-1">
        {BOTTOM_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-dynasty-gold/10 text-dynasty-gold border border-dynasty-gold/20'
                  : 'text-dynasty-gray-400 hover:bg-dynasty-gray-800 hover:text-dynasty-cream'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              {label}
            </Link>
          )
        })}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-dynasty-gray-400 transition-all duration-150 hover:bg-dynasty-gray-800 hover:text-red-400"
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
