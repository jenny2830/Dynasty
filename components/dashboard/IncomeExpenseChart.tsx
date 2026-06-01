'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useAppTheme } from '@/lib/theme-context'

interface ChartDataPoint {
  month: string
  income: number
  expenses: number
}

interface IncomeExpenseChartProps {
  data: ChartDataPoint[]
}

interface TooltipPayloadEntry {
  value: number
  name: string
  color: string
}

function CustomTooltip({
  active,
  payload,
  label,
  tooltipBg,
  tooltipBorder,
  axisText,
  textPrimary,
  textSecondary,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
  tooltipBg: string
  tooltipBorder: string
  axisText: string
  textPrimary: string
  textSecondary: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div style={{
      borderRadius: '1px',
      border: `1px solid ${tooltipBorder}`,
      background: tooltipBg,
      padding: '12px 16px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    }}>
      <p style={{
        marginBottom: '8px',
        fontFamily: "'Jost', sans-serif",
        fontSize: '9px',
        fontWeight: 300,
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        color: axisText,
      }}>
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '1px',
            backgroundColor: entry.color,
            flexShrink: 0,
          }} />
          <span style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, color: textSecondary, textTransform: 'capitalize' }}>
            {entry.name}:
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: textPrimary }}>
            ${entry.value.toLocaleString('en-CA', { minimumFractionDigits: 0 })}
          </span>
        </div>
      ))}
    </div>
  )
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  const { theme } = useAppTheme()

  if (data.length === 0) {
    return (
      <div style={{ display: 'flex', height: '192px', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: '12px',
          fontWeight: 300,
          letterSpacing: '0.06em',
          color: theme.textMuted,
        }}>
          No transaction data yet
        </p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} barGap={6} barCategoryGap="30%">
        <CartesianGrid
          strokeDasharray="2 4"
          stroke={theme.chartGrid}
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fill: theme.chartAxisText, fontSize: 10, fontFamily: 'var(--font-jost)', letterSpacing: '0.1em' }}
          axisLine={false}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis
          tick={{ fill: theme.chartAxisText, fontSize: 10, fontFamily: 'var(--font-jost)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) =>
            v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
          }
          width={48}
        />
        <Tooltip
          content={
            <CustomTooltip
              tooltipBg={theme.chartTooltipBg}
              tooltipBorder={theme.chartTooltipBorder}
              axisText={theme.chartAxisText}
              textPrimary={theme.textPrimary}
              textSecondary={theme.textSecondary}
            />
          }
          cursor={{ fill: `${theme.accent}08` }}
        />
        <Legend
          wrapperStyle={{
            fontSize: 10,
            color: theme.chartAxisText,
            paddingTop: 12,
            fontFamily: 'var(--font-jost)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
          iconType="square"
          iconSize={8}
          formatter={(value: string) => (
            <span style={{
              color: value === 'expenses' ? theme.chartExpense : theme.chartIncome,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              fontSize: 10,
            }}>
              {value}
            </span>
          )}
        />
        <Bar dataKey="income" fill={theme.chartIncome} radius={[1, 1, 0, 0]} name="income" />
        <Bar dataKey="expenses" fill={theme.chartExpense} radius={[1, 1, 0, 0]} name="expenses" />
      </BarChart>
    </ResponsiveContainer>
  )
}
