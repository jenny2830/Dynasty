import { Building2, TrendingUp, DollarSign, Bell } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  subtext?: string
  trend?: { value: number; label: string }
  icon: React.ReactNode
  highlight?: boolean
}

function StatCard({ label, value, subtext, trend, icon, highlight }: StatCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl p-5 border transition-colors',
        highlight
          ? 'bg-dynasty-gray-800 border-dynasty-gold/30'
          : 'bg-dynasty-gray-900 border-dynasty-gray-700'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-dynasty-gray-400">
            {label}
          </p>
          <p
            className={cn(
              'mt-2 font-mono text-2xl font-semibold tracking-tight',
              highlight ? 'text-dynasty-gold' : 'text-dynasty-cream'
            )}
          >
            {value}
          </p>
          {subtext && (
            <p className="mt-1 text-xs text-dynasty-gray-400">{subtext}</p>
          )}
          {trend && (
            <p
              className={cn(
                'mt-2 text-xs font-medium',
                trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}
            >
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%{' '}
              <span className="text-dynasty-gray-400 font-normal">{trend.label}</span>
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            highlight
              ? 'bg-dynasty-gold/15 text-dynasty-gold'
              : 'bg-dynasty-gray-800 text-dynasty-gray-400'
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

interface StatsCardsProps {
  totalPortfolioValue: number
  monthlyNetIncome: number
  activeProperties: number
  pendingReminders: number
}

export function StatsCards({
  totalPortfolioValue,
  monthlyNetIncome,
  activeProperties,
  pendingReminders,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Portfolio Value"
        value={formatCurrency(totalPortfolioValue)}
        subtext="Total current value"
        icon={<Building2 className="h-5 w-5" strokeWidth={1.5} />}
        highlight
      />
      <StatCard
        label="Monthly Net Income"
        value={formatCurrency(monthlyNetIncome)}
        subtext="Income minus expenses"
        trend={{ value: 4.2, label: 'vs last month' }}
        icon={<TrendingUp className="h-5 w-5" strokeWidth={1.5} />}
        highlight
      />
      <StatCard
        label="Active Properties"
        value={activeProperties.toString()}
        subtext="Across all units"
        icon={<DollarSign className="h-5 w-5" strokeWidth={1.5} />}
      />
      <StatCard
        label="Pending Reminders"
        value={pendingReminders.toString()}
        subtext={pendingReminders === 0 ? 'All clear' : 'Action required'}
        icon={<Bell className="h-5 w-5" strokeWidth={1.5} />}
      />
    </div>
  )
}
