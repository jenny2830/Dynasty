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

interface ChartDataPoint {
  month: string
  income: number
  expenses: number
}

interface IncomeExpenseChartProps {
  data: ChartDataPoint[]
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number; name: string; color: string }[]
  label?: string
}) => {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-dynasty-gray-700 bg-dynasty-gray-800 p-3 shadow-xl">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-dynasty-gray-400">
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-dynasty-gray-200 capitalize">{entry.name}:</span>
          <span className="font-mono font-semibold text-dynasty-cream">
            ${entry.value.toLocaleString('en-CA', { minimumFractionDigits: 0 })}
          </span>
        </div>
      ))}
    </div>
  )
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-dynasty-gray-400">No transaction data yet</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barGap={4} barCategoryGap="30%">
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#2A2A2A"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fill: '#888888', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#888888', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) =>
            v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
          }
          width={48}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#2A2A2A' }} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: '#888888', paddingTop: 8 }}
          formatter={(value: string) => (
            <span style={{ color: '#CCCCCC', textTransform: 'capitalize' }}>
              {value}
            </span>
          )}
        />
        <Bar dataKey="income" fill="#C9A84C" radius={[4, 4, 0, 0]} name="income" />
        <Bar dataKey="expenses" fill="#3A3A3A" radius={[4, 4, 0, 0]} name="expenses" />
      </BarChart>
    </ResponsiveContainer>
  )
}
