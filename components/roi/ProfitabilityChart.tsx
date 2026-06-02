'use client'
import { useAppTheme } from '@/lib/theme-context'
import { useThemeStyles } from '@/lib/useThemeStyles'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  ComposedChart,
  Line,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

export interface ProfitabilityResults {
  purchasePrice: number
  downPayment: number
  closingCosts: number
  monthlyRent: number
  monthlyExpenses: number
  monthlyMortgage: number
  currentValue: number
  monthlyCashFlow: number
  annualCashFlow: number
  capRate: number
  cashOnCash: number
  grossYield: number
  netYield: number
  equity: number
  totalInvestment: number
}

export function ProfitabilityChart({ results }: { results: ProfitabilityResults }) {
  const { theme } = useAppTheme()
  const styles = useThemeStyles()

  const tooltipContentStyle = {
    background: theme.chartTooltipBg,
    border: `1px solid ${theme.chartTooltipBorder}`,
    borderRadius: '2px',
    fontFamily: "'Jost', sans-serif",
    fontSize: '12px',
    color: theme.textPrimary,
    padding: '10px 14px',
  }

  // ── PIE CHART: Monthly cash distribution ──
  const pieData = [
    { name: 'Net Cash Flow', value: Math.max(0, results.monthlyCashFlow) },
    { name: 'Mortgage',      value: results.monthlyMortgage },
    { name: 'Operating Exp', value: results.monthlyExpenses },
  ].filter(d => d.value > 0)

  const pieColors = [theme.accent, theme.valueNegative, theme.accentMuted]

  // ── BAR CHART: Annual income vs costs ──
  const barData = [{
    name: 'Annual',
    'Gross Rent':  results.monthlyRent * 12,
    'Expenses':   -(results.monthlyExpenses * 12),
    'Mortgage':   -(results.monthlyMortgage * 12),
    'Net Income':  results.annualCashFlow,
  }]

  // ── COMPOSED CHART: 10-year projection ──
  const projectionData = Array.from({ length: 11 }, (_, year) => {
    const propertyValue = results.currentValue * Math.pow(1.03, year)
    const loanBalance = Math.max(0,
      (results.purchasePrice - results.downPayment) -
      (results.monthlyMortgage * 12 * year * 0.3)
    )
    const equity = propertyValue - loanBalance
    const cumulativeCashFlow = results.annualCashFlow * year
    return {
      year: `Y${year}`,
      'Property Value':       Math.round(propertyValue),
      'Equity':               Math.round(equity),
      'Cumulative Cash Flow': Math.round(cumulativeCashFlow),
    }
  })

  // ── KEY METRICS ──
  const metricsData = [
    { name: 'Cap Rate',    value: results.capRate },
    { name: 'Cash-on-Cash', value: results.cashOnCash },
    { name: 'Gross Yield', value: results.grossYield },
    { name: 'Net Yield',   value: results.netYield },
  ]

  const cardStyle: React.CSSProperties = {
    background: theme.cardBg,
    border: theme.cardBorder,
    borderRadius: '2px',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  }

  const cornerTL: React.CSSProperties = { position: 'absolute', top: '6px', left: '6px', width: '14px', height: '14px', borderTop: `1px solid ${theme.cornerMark}`, borderLeft: `1px solid ${theme.cornerMark}` }
  const cornerBR: React.CSSProperties = { position: 'absolute', bottom: '6px', right: '6px', width: '14px', height: '14px', borderBottom: `1px solid ${theme.cornerMark}`, borderRight: `1px solid ${theme.cornerMark}` }
  const topAccent: React.CSSProperties = { position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: theme.topLine }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── KEY METRICS BAR ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
      }}>
        {metricsData.map(metric => (
          <div key={metric.name} style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={topAccent} />
            <p style={{ ...styles.cardLabel, marginBottom: '8px' }}>{metric.name}</p>
            <p style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontWeight: styles.cardValue.fontWeight,
              fontSize: '32px',
              color: metric.value >= 0 ? theme.accent : theme.valueNegative,
              lineHeight: 1,
              margin: 0,
            }}>
              {metric.value.toFixed(1)}%
            </p>
          </div>
        ))}
      </div>

      {/* ── MONTHLY BREAKDOWN PIE ── */}
      <div style={cardStyle}>
        <div style={cornerTL} />
        <div style={cornerBR} />
        <div style={topAccent} />

        <h3 style={{ ...styles.cardTitle, marginBottom: '4px' }}>
          <span style={{ color: theme.accent, fontSize: '8px', marginRight: '8px' }}>◆</span>
          Monthly Breakdown
        </h3>
        <p style={{ ...styles.mutedText, marginBottom: '20px' }}>
          Where your rental income goes each month
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
          <div style={{ flex: '1 1 250px', minHeight: '250px', minWidth: 0 }}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any) => formatCurrency(Number(v))}
                  contentStyle={tooltipContentStyle}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
            {pieData.map((entry, i) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '1px', background: pieColors[i % pieColors.length], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ ...styles.bodyText, marginBottom: '2px', fontSize: '12px' }}>{entry.name}</p>
                  <p style={{ ...styles.financial, color: i === 0 ? theme.accent : theme.valueNegative }}>
                    {formatCurrency(entry.value)}/mo
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 10-YEAR PROJECTION ── */}
      <div style={cardStyle}>
        <div style={cornerTL} />
        <div style={cornerBR} />
        <div style={topAccent} />

        <h3 style={{ ...styles.cardTitle, marginBottom: '4px' }}>
          <span style={{ color: theme.accent, fontSize: '8px', marginRight: '8px' }}>◆</span>
          10-Year Projection
        </h3>
        <p style={{ ...styles.mutedText, marginBottom: '20px' }}>
          Estimated equity growth at 3% annual appreciation
        </p>

        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={projectionData}>
            <CartesianGrid stroke={theme.chartGrid} strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              tick={{ fill: theme.chartAxisText, fontSize: 10, fontFamily: "'Jost', sans-serif" }}
              axisLine={{ stroke: theme.chartGrid }}
              tickLine={{ stroke: theme.chartGrid }}
            />
            <YAxis
              tick={{ fill: theme.chartAxisText, fontSize: 10, fontFamily: "'Jost', sans-serif" }}
              axisLine={{ stroke: theme.chartGrid }}
              tickLine={{ stroke: theme.chartGrid }}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any, name: any) => [formatCurrency(Number(v)), name]}
              contentStyle={tooltipContentStyle}
            />
            <Legend
              formatter={(value) => (
                <span style={{ ...styles.badge, color: theme.textMuted }}>{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="Property Value"
              fill={`${theme.accent}15`}
              stroke={theme.accent}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="Equity"
              stroke={theme.accentLight}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
            <Bar
              dataKey="Cumulative Cash Flow"
              fill={`${theme.accent}40`}
              stroke={theme.accent}
              strokeWidth={1}
              radius={[2, 2, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── ANNUAL INCOME VS COSTS ── */}
      <div style={cardStyle}>
        <div style={cornerTL} />
        <div style={cornerBR} />
        <div style={topAccent} />

        <h3 style={{ ...styles.cardTitle, marginBottom: '4px' }}>
          <span style={{ color: theme.accent, fontSize: '8px', marginRight: '8px' }}>◆</span>
          Annual Income vs Costs
        </h3>
        <p style={{ ...styles.mutedText, marginBottom: '20px' }}>
          Yearly revenue against total expenses and mortgage
        </p>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} layout="vertical">
            <CartesianGrid stroke={theme.chartGrid} strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: theme.chartAxisText, fontSize: 10, fontFamily: "'Jost', sans-serif" }}
              axisLine={{ stroke: theme.chartGrid }}
              tickLine={{ stroke: theme.chartGrid }}
              tickFormatter={(v: number) => `$${(Math.abs(v) / 1000).toFixed(0)}k`}
            />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any, name: any) => [formatCurrency(Math.abs(Number(v))), name]}
              contentStyle={tooltipContentStyle}
            />
            <Bar dataKey="Gross Rent"  fill={theme.accent}       radius={[0, 2, 2, 0]} />
            <Bar dataKey="Expenses"    fill={theme.valueNegative} radius={[2, 0, 0, 2]} />
            <Bar dataKey="Mortgage"    fill={theme.accentMuted}   radius={[2, 0, 0, 2]} />
            <Bar dataKey="Net Income"  fill={theme.accentLight}   radius={[0, 2, 2, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}
