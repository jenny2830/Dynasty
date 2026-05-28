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
    <div
      className="rounded-[1px] border bg-dynasty-black-card px-4 py-3 shadow-[var(--shadow-card)]"
      style={{ borderColor: 'rgba(201, 168, 76, 0.2)' }}
    >
      <p className="mb-2 font-sans text-[9px] font-light uppercase tracking-[0.2em] text-dynasty-gray-400">
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-[12px]">
          <span
            className="h-2 w-2 rounded-[1px]"
            style={{ backgroundColor: entry.color }}
          />
          <span className="font-light text-dynasty-gray-300 capitalize">
            {entry.name}:
          </span>
          <span className="font-mono font-medium text-dynasty-warm-white">
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
        <p className="font-sans text-[12px] font-light tracking-[0.06em] text-dynasty-gray-500">
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
          stroke="rgba(255,255,255,0.03)"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fill: '#333330', fontSize: 10, fontFamily: 'var(--font-jost)', letterSpacing: '0.1em' }}
          axisLine={false}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis
          tick={{ fill: '#333330', fontSize: 10, fontFamily: 'var(--font-jost)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) =>
            v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
          }
          width={48}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201,168,76,0.04)' }} />
        <Legend
          wrapperStyle={{
            fontSize: 10,
            color: '#6B6B65',
            paddingTop: 12,
            fontFamily: 'var(--font-jost)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
          iconType="square"
          iconSize={8}
          formatter={(value: string) => (
            <span
              style={{
                color: value === 'expenses' ? '#B76E79' : '#C9A84C',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                fontSize: 10,
              }}
            >
              {value}
            </span>
          )}
        />
        <Bar dataKey="income" fill="#C9A84C" radius={[1, 1, 0, 0]} name="income" />
        <Bar dataKey="expenses" fill="#B76E79" radius={[1, 1, 0, 0]} name="expenses" />
      </BarChart>
    </ResponsiveContainer>
  )
}
