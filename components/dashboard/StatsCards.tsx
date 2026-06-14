'use client'

import { Building2, TrendingUp, DollarSign, Bell } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useAppTheme } from '@/lib/theme-context'
import { useThemeStyles } from '@/lib/useThemeStyles'

function getValueFontSize(value: string): string {
  const len = value.length
  if (len <= 8) return 'clamp(22px, 3vw, 32px)'
  if (len <= 11) return 'clamp(18px, 2.5vw, 26px)'
  if (len <= 14) return 'clamp(15px, 2vw, 22px)'
  return 'clamp(13px, 1.6vw, 18px)'
}

interface StatCardProps {
  label: string
  value: string
  subtext?: string
  trend?: { value: number; label: string }
  icon: React.ReactNode
  highlight?: boolean
  negative?: boolean
  alert?: boolean
  responsiveValue?: boolean
}

function StatCard({
  label,
  value,
  subtext,
  trend,
  icon,
  highlight,
  negative,
  alert,
  responsiveValue = false,
}: StatCardProps) {
  const { theme, fontWeights } = useAppTheme()
  const styles = useThemeStyles()

  return (
    <div style={{
      position: 'relative',
      background: theme.cardBg,
      border: theme.cardBorder,
      borderRadius: '2px',
      boxShadow: theme.cardShadow,
      padding: '28px',
      overflow: 'hidden',
      transition: 'background 0.3s, border-color 0.3s',
      minWidth: 0,
    }}>
      <div style={{ position: 'absolute', top: '6px', left: '6px', width: '14px', height: '14px', borderTop: `1px solid ${theme.cornerMark}`, borderLeft: `1px solid ${theme.cornerMark}`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '14px', height: '14px', borderBottom: `1px solid ${theme.cornerMark}`, borderRight: `1px solid ${theme.cornerMark}`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: theme.topLine }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
          <p style={{
            ...styles.cardLabel,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0 0 10px 0',
          }}>
            <span style={{ fontSize: '6px', color: theme.cornerMark, lineHeight: 1, flexShrink: 0 }}>◆</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
          </p>

          <p style={{
            fontFamily: "'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: fontWeights.medium,
            fontSize: responsiveValue ? getValueFontSize(value) : '40px',
            lineHeight: 1,
            letterSpacing: '0.04em',
            color: negative ? theme.valueNegative : theme.accent,
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            {alert && (
              <span
                aria-hidden
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: theme.accent,
                  flexShrink: 0,
                  animation: 'dynasty-pulse 2s ease-in-out infinite',
                }}
              />
            )}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
              {value}
            </span>
          </p>

          {subtext && (
            <p style={{
              fontFamily: "'Jost', sans-serif",
              fontWeight: fontWeights.body,
              fontSize: '15px',
              letterSpacing: '0.04em',
              color: theme.textSecondary,
              margin: '8px 0 0 0',
            }}>
              {subtext}
            </p>
          )}

          {trend && (
            <p style={{
              marginTop: '8px',
              fontFamily: "'Jost', sans-serif",
              fontWeight: fontWeights.thin,
              fontSize: '15px',
              letterSpacing: '0.04em',
              color: trend.value >= 0 ? theme.valuePositive : theme.valueNegative,
              margin: '8px 0 0 0',
            }}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%{' '}
              <span style={{ color: theme.textMuted }}>{trend.label}</span>
            </p>
          )}
        </div>

        <div style={{
          display: 'flex',
          height: '36px',
          width: '36px',
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '1px',
          border: highlight ? `1px solid ${theme.accent}40` : `1px solid ${theme.accent}1F`,
          background: highlight ? `${theme.accent}0F` : `${theme.accent}0A`,
          color: highlight ? theme.accent : `${theme.accent}99`,
        }}>
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
  displayCurrency?: string
}

export function StatsCards({
  totalPortfolioValue,
  monthlyNetIncome,
  activeProperties,
  pendingReminders,
  displayCurrency = 'CAD',
}: StatsCardsProps) {
  const portfolioFormatted = formatCurrency(totalPortfolioValue, displayCurrency, 0)
  const netFormatted = formatCurrency(monthlyNetIncome, displayCurrency, 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
      <StatCard
        label="Portfolio Value"
        value={portfolioFormatted}
        subtext="Total current value"
        icon={<Building2 style={{ width: '16px', height: '16px' }} strokeWidth={1.2} />}
        highlight
        responsiveValue
      />
      <StatCard
        label="Monthly Net Income"
        value={netFormatted}
        subtext="This month · income minus expenses"
        icon={<TrendingUp style={{ width: '16px', height: '16px' }} strokeWidth={1.2} />}
        highlight
        negative={monthlyNetIncome < 0}
        responsiveValue
      />
      <StatCard
        label="Active Properties"
        value={activeProperties.toString()}
        subtext="Across all units"
        icon={<DollarSign style={{ width: '16px', height: '16px' }} strokeWidth={1.2} />}
        responsiveValue
      />
      <StatCard
        label="Pending Reminders"
        value={pendingReminders.toString()}
        subtext={pendingReminders === 0 ? 'All clear' : 'Action required'}
        icon={<Bell style={{ width: '16px', height: '16px' }} strokeWidth={1.2} />}
        alert={pendingReminders > 0}
        responsiveValue
      />
    </div>
  )
}
