'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, Building2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, formatPercent } from '@/lib/utils'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface Property {
  id: string
  name: string
  purchase_price: number | null
  current_value: number | null
  mortgage_balance: number | null
  monthly_mortgage: number | null
  condo_fee: number | null
  strata_fee: number | null
}

interface ROIInputs {
  purchasePrice: number
  downPayment: number
  closingCosts: number
  monthlyRent: number
  monthlyExpenses: number
  monthlyMortgage: number
  currentValue: number
}

interface ROIResults {
  capRate: number
  cashOnCash: number
  grossYield: number
  netYield: number
  monthlyCashFlow: number
  annualCashFlow: number
  equity: number
  totalCashInvested: number
  annualNOI: number
}

function calculate(inputs: ROIInputs): ROIResults | null {
  if (inputs.purchasePrice <= 0) return null

  const monthlyGrossIncome = inputs.monthlyRent
  const monthlyNOI = monthlyGrossIncome - inputs.monthlyExpenses
  const annualNOI = monthlyNOI * 12
  const annualRent = inputs.monthlyRent * 12
  const totalCashInvested = inputs.downPayment + inputs.closingCosts

  const capRate = (annualNOI / inputs.purchasePrice) * 100
  const grossYield = (annualRent / inputs.purchasePrice) * 100
  const netYield = (annualNOI / inputs.purchasePrice) * 100
  const monthlyCashFlow = monthlyNOI - inputs.monthlyMortgage
  const annualCashFlow = monthlyCashFlow * 12
  const cashOnCash = totalCashInvested > 0 ? (annualCashFlow / totalCashInvested) * 100 : 0
  const equity = inputs.currentValue - (inputs.purchasePrice - inputs.downPayment)

  return {
    capRate,
    cashOnCash,
    grossYield,
    netYield,
    monthlyCashFlow,
    annualCashFlow,
    equity,
    totalCashInvested,
    annualNOI,
  }
}

const EMPTY_INPUTS: ROIInputs = {
  purchasePrice: 0,
  downPayment: 0,
  closingCosts: 0,
  monthlyRent: 0,
  monthlyExpenses: 0,
  monthlyMortgage: 0,
  currentValue: 0,
}

interface ROICalculatorProps {
  properties: Property[]
}

export function ROICalculator({ properties }: ROICalculatorProps) {
  const [inputs, setInputs] = useState<ROIInputs>(EMPTY_INPUTS)

  const set = (key: keyof ROIInputs) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputs((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))

  function loadFromProperty(propertyId: string) {
    const p = properties.find((x) => x.id === propertyId)
    if (!p) return
    setInputs({
      purchasePrice: p.purchase_price ?? 0,
      downPayment: p.purchase_price && p.mortgage_balance
        ? p.purchase_price - p.mortgage_balance
        : 0,
      closingCosts: 0,
      monthlyRent: 0,
      monthlyExpenses: (p.condo_fee ?? 0) + (p.strata_fee ?? 0),
      monthlyMortgage: p.monthly_mortgage ?? 0,
      currentValue: p.current_value ?? p.purchase_price ?? 0,
    })
  }

  const results = useMemo(() => calculate(inputs), [inputs])

  const inputFields: { key: keyof ROIInputs; label: string; help?: string }[] = [
    { key: 'purchasePrice', label: 'Purchase Price (CAD)', help: 'Original acquisition price' },
    { key: 'downPayment', label: 'Down Payment (CAD)', help: 'Cash paid upfront' },
    { key: 'closingCosts', label: 'Closing Costs (CAD)', help: 'Legal, inspection, taxes' },
    { key: 'monthlyRent', label: 'Monthly Rent (CAD)', help: 'Gross rental income' },
    { key: 'monthlyExpenses', label: 'Monthly Operating Expenses (CAD)', help: 'Insurance, taxes, maintenance, fees' },
    { key: 'monthlyMortgage', label: 'Monthly Mortgage Payment (CAD)', help: 'Principal + interest' },
    { key: 'currentValue', label: 'Current Market Value (CAD)', help: 'For equity calculation' },
  ]

  const headlineMetrics = results
    ? [
        {
          label: 'Cap Rate',
          value: formatPercent(results.capRate),
          help: 'NOI ÷ Purchase Price',
          positive: results.capRate > 0,
        },
        {
          label: 'Cash-on-Cash',
          value: formatPercent(results.cashOnCash),
          help: 'Annual cash flow ÷ Cash invested',
          positive: results.cashOnCash > 0,
        },
      ]
    : []

  const subMetrics = results
    ? [
        { label: 'Gross Yield', value: formatPercent(results.grossYield), positive: results.grossYield > 0 },
        { label: 'Net Yield', value: formatPercent(results.netYield), positive: results.netYield > 0 },
        { label: 'Monthly Cash Flow', value: formatCurrency(results.monthlyCashFlow), positive: results.monthlyCashFlow > 0 },
        { label: 'Annual Cash Flow', value: formatCurrency(results.annualCashFlow), positive: results.annualCashFlow > 0 },
        { label: 'Equity', value: formatCurrency(results.equity), positive: results.equity > 0 },
        { label: 'Annual NOI', value: formatCurrency(results.annualNOI), positive: results.annualNOI > 0 },
      ]
    : []

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Inputs panel */}
      <div className="space-y-6">
        {properties.length > 0 && (
          <div className="rounded-[2px] border border-[rgba(201,168,76,0.18)] bg-[rgba(201,168,76,0.04)] px-5 py-4">
            <div className="mb-3 flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-dynasty-gold" strokeWidth={1.2} />
              <p className="font-sans text-[10px] font-light uppercase tracking-[0.2em] text-dynasty-gold">
                Load From Property
              </p>
            </div>
            <Select onValueChange={loadFromProperty}>
              <SelectTrigger>
                <SelectValue placeholder="Select a property to auto-fill…" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Section className="px-7 py-6 space-y-5">
          <h2 className="pb-3 border-b border-[rgba(201,168,76,0.08)] font-sans text-[9px] font-light uppercase tracking-[0.2em] text-dynasty-gray-500">
            Inputs
          </h2>
          {inputFields.map(({ key, label, help }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              {help && (
                <p className="font-sans text-[11px] font-light tracking-[0.04em] text-dynasty-gray-500 -mt-1">
                  {help}
                </p>
              )}
              <Input
                id={key}
                type="number"
                min="0"
                step="100"
                value={inputs[key] || ''}
                onChange={set(key)}
                placeholder="0"
              />
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputs(EMPTY_INPUTS)}
            className="mt-2"
          >
            Clear All
          </Button>
        </Section>
      </div>

      {/* Results panel */}
      <div className="space-y-5">
        <Section variant="warm" className="px-7 py-6">
          <h2 className="mb-5 pb-3 border-b border-[rgba(201,168,76,0.08)] font-sans text-[9px] font-light uppercase tracking-[0.2em] text-dynasty-gray-500">
            Results
          </h2>

          {!results ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <TrendingUp className="h-8 w-8 text-dynasty-gold/15" strokeWidth={1} />
              <p className="mt-4 font-serif text-[16px] font-medium tracking-[0.02em] text-dynasty-gray-300">
                Awaiting Inputs
              </p>
              <p className="mt-1.5 font-sans text-[11px] font-light tracking-[0.06em] text-dynasty-gray-500">
                Enter purchase price to begin calculations
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Headline metrics — Bebas display */}
              <div className="grid grid-cols-2 gap-4">
                {headlineMetrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-[1px] border border-[rgba(201,168,76,0.12)] bg-[rgba(201,168,76,0.04)] px-5 py-4"
                  >
                    <p className="font-sans text-[9px] font-light uppercase tracking-[0.2em] text-dynasty-gray-500">
                      {m.label}
                    </p>
                    <p
                      className={`mt-2 font-display text-[44px] leading-none tracking-[0.04em] ${
                        m.positive ? 'text-dynasty-gold' : 'text-dynasty-rose-gold'
                      }`}
                    >
                      {m.value}
                    </p>
                    {m.help && (
                      <p className="mt-2 font-sans text-[10px] font-light tracking-[0.04em] text-dynasty-gray-500">
                        {m.help}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Sub-metrics grid */}
              <div className="grid grid-cols-2 gap-3">
                {subMetrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-[1px] border border-[rgba(201,168,76,0.06)] bg-dynasty-black-soft px-4 py-3"
                  >
                    <p className="font-sans text-[9px] font-light uppercase tracking-[0.2em] text-dynasty-gray-500">
                      {m.label}
                    </p>
                    <p
                      className={`mt-1 font-mono text-[16px] font-medium tracking-tight ${
                        m.positive ? 'text-dynasty-gold' : 'text-dynasty-rose-gold'
                      }`}
                    >
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>

        {results && (
          <Section className="px-6 py-5">
            <p className="mb-4 font-serif text-[18px] font-medium text-dynasty-warm-white">
              <span className="mr-2 text-[8px] text-dynasty-gold leading-none">◆</span>
              Monthly Breakdown
            </p>
            {(() => {
              const pieData = [
                { name: 'Net Cash Flow', value: Math.max(0, results.monthlyCashFlow), color: '#C9A84C' },
                { name: 'Mortgage', value: inputs.monthlyMortgage, color: '#B76E79' },
                { name: 'Expenses', value: inputs.monthlyExpenses, color: '#8B4F58' },
              ].filter((d) => d.value > 0)

              if (pieData.length === 0) return null

              return (
                <ResponsiveContainer width="100%" height={260}>
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
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [formatCurrency(typeof value === 'number' ? value : 0), '']}
                      contentStyle={{
                        background: '#161616',
                        border: '1px solid rgba(201,168,76,0.2)',
                        borderRadius: '1px',
                        fontFamily: "'Jost', sans-serif",
                        fontSize: '12px',
                        color: '#FAF7F2',
                      }}
                    />
                    <Legend
                      formatter={(value) => (
                        <span style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: '10px',
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: '#8A8A82',
                        }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )
            })()}
          </Section>
        )}

        {results && (
          <Section className="px-6 py-5">
            <p className="mb-3 font-sans text-[9px] font-light uppercase tracking-[0.2em] text-dynasty-gold/80">
              <span className="mr-2 text-[6px] text-[rgba(201,168,76,0.5)] leading-none">◆</span>
              Canadian Market Benchmarks
            </p>
            <ul className="space-y-1.5 font-sans text-[12px] font-light tracking-[0.02em] text-dynasty-gray-300">
              <li>Cap Rate &gt; 5% is generally considered good for residential</li>
              <li>Cash-on-Cash &gt; 8–10% indicates strong cash flow</li>
              <li>Monthly cash flow should be positive after all expenses</li>
            </ul>
            <p className="mt-3 font-sans text-[10px] font-light italic tracking-[0.04em] text-dynasty-gray-500">
              * Estimates for planning purposes only. Consult a financial advisor for investment decisions.
            </p>
          </Section>
        )}
      </div>
    </div>
  )
}
