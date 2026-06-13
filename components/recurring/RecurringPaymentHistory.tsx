'use client'

import { useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAppTheme } from '@/lib/theme-context'
import { useThemeStyles } from '@/lib/useThemeStyles'
import { Section, SectionHeader } from '@/components/ui/section'

type HistoryRow = {
  id: string
  amount: number
  category: string
  transaction_date: string
  description: string | null
  property_id: string | null
  properties: { name: string } | null
}

type PropertyOption = {
  id: string
  name: string
}

interface RecurringPaymentHistoryProps {
  history: HistoryRow[]
  properties: PropertyOption[]
}

export function RecurringPaymentHistory({ history, properties }: RecurringPaymentHistoryProps) {
  const { theme } = useAppTheme()
  const styles = useThemeStyles()
  const [historyFilter, setHistoryFilter] = useState('all')

  const filtered = history.filter(
    (t) => historyFilter === 'all' || t.property_id === historyFilter,
  )

  return (
    <Section className="relative overflow-hidden">
      <SectionHeader
        title="Payment History"
        description="All recurring payments made since account creation"
      />

      <div
        className="px-6 py-4"
        style={{ borderBottom: `1px solid ${theme.dividerColor}` }}
      >
        <select
          value={historyFilter}
          onChange={(e) => setHistoryFilter(e.target.value)}
          aria-label="Filter by property"
          style={{
            background: theme.inputBg,
            border: `1px solid ${theme.inputBorder}`,
            color: theme.textPrimary,
            fontFamily: "'Jost', sans-serif",
            fontSize: '12px',
            letterSpacing: '0.06em',
            padding: '8px 12px',
            borderRadius: '1px',
            cursor: 'pointer',
            minWidth: '200px',
          }}
        >
          <option value="all">All Properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length > 0 ? (
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: theme.tableHeaderBg }}>
                {['Date', 'Description', 'Property', 'Category', 'Amount'].map((col, i) => (
                  <th
                    key={col}
                    style={{
                      ...styles.tableHeader,
                      padding: '12px 24px',
                      textAlign: i === 4 ? 'right' : 'left',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((transaction, i) => (
                <tr
                  key={transaction.id}
                  style={{
                    borderBottom: `1px solid ${theme.tableRowBorder}`,
                    background: i % 2 === 0 ? 'transparent' : `${theme.accent}04`,
                  }}
                >
                  <td style={{ ...styles.tableCell, padding: '14px 24px' }}>
                    {formatDate(transaction.transaction_date)}
                  </td>
                  <td style={{ ...styles.tableCell, padding: '14px 24px' }}>
                    {transaction.description ?? '—'}
                  </td>
                  <td style={{ ...styles.tableCell, padding: '14px 24px' }}>
                    {transaction.properties?.name ?? '—'}
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span
                      style={{
                        ...styles.badge,
                        background: `${theme.valueNegative}12`,
                        color: theme.valueNegative,
                        border: `1px solid ${theme.valueNegative}30`,
                      }}
                    >
                      {transaction.category}
                    </span>
                  </td>
                  <td
                    style={{
                      ...styles.financial,
                      color: theme.valueNegative,
                      padding: '14px 24px',
                      textAlign: 'right',
                    }}
                  >
                    −{formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '48px', textAlign: 'center' }}>
          <p style={styles.mutedText}>No payment history yet.</p>
        </div>
      )}
    </Section>
  )
}
