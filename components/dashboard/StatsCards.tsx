import { Building2, TrendingUp, DollarSign, Bell } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  subtext?: string
  trend?: { value: number; label: string }
  icon: React.ReactNode
  highlight?: boolean
  negative?: boolean
}

function StatCard({ label, value, subtext, trend, icon, highlight, negative }: StatCardProps) {
  return (
    <div
      className={cn(
        'stat-card lux-card deco-corners-4 deco-top-line',
        'group px-7 pt-7 pb-6'
      )}
    >
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Label with diamond ornament */}
          <p
            className={cn(
              'flex items-center gap-2 uppercase',
              'font-sans font-light text-[9px] tracking-[0.22em]',
              'text-dynasty-gray-500 mb-2.5'
            )}
          >
            <span className="text-[6px] text-[rgba(201,168,76,0.5)] leading-none">◆</span>
            <span className="truncate">{label}</span>
          </p>

          {/* Value — Bebas Neue display with gradient fill */}
          <p
            className={cn(
              'font-display text-[40px] leading-none tracking-[0.04em]',
              negative ? 'text-rose-gradient' : 'text-gold-gradient'
            )}
          >
            {value}
          </p>

          {subtext && (
            <p
              className={cn(
                'mt-2 font-sans font-light text-[11px] tracking-[0.04em]',
                'text-dynasty-gray-600'
              )}
            >
              {subtext}
            </p>
          )}

          {trend && (
            <p
              className={cn(
                'mt-2 font-sans text-[11px] font-light tracking-[0.04em]',
                trend.value >= 0 ? 'text-dynasty-gold' : 'text-dynasty-rose-gold'
              )}
            >
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%{' '}
              <span className="text-dynasty-gray-600">{trend.label}</span>
            </p>
          )}
        </div>

        {/* Icon box */}
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-[1px]',
            'border transition-colors',
            highlight
              ? 'border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.06)] text-dynasty-gold'
              : 'border-[rgba(201,168,76,0.12)] bg-[rgba(201,168,76,0.04)] text-dynasty-gold/60'
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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Portfolio Value"
        value={formatCurrency(totalPortfolioValue)}
        subtext="Total current value"
        icon={<Building2 className="h-4 w-4" strokeWidth={1.2} />}
        highlight
      />
      <StatCard
        label="Monthly Net Income"
        value={formatCurrency(monthlyNetIncome)}
        subtext="Income minus expenses"
        trend={{ value: 4.2, label: 'vs last month' }}
        icon={<TrendingUp className="h-4 w-4" strokeWidth={1.2} />}
        highlight
        negative={monthlyNetIncome < 0}
      />
      <StatCard
        label="Active Properties"
        value={activeProperties.toString()}
        subtext="Across all units"
        icon={<DollarSign className="h-4 w-4" strokeWidth={1.2} />}
      />
      <StatCard
        label="Pending Reminders"
        value={pendingReminders.toString()}
        subtext={pendingReminders === 0 ? 'All clear' : 'Action required'}
        icon={<Bell className="h-4 w-4" strokeWidth={1.2} />}
      />
    </div>
  )
}
