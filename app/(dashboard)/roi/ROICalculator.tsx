'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, DollarSign, Percent, Building2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, formatPercent } from '@/lib/utils'

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

  const resultMetrics = results
    ? [
        {
          label: 'Cap Rate',
          value: formatPercent(results.capRate),
          help: 'NOI ÷ Purchase Price',
          gold: true,
        },
        {
          label: 'Cash-on-Cash Return',
          value: formatPercent(results.cashOnCash),
          help: 'Annual cash flow ÷ Cash invested',
          gold: results.cashOnCash > 0,
        },
        {
          label: 'Gross Yield',
          value: formatPercent(results.grossYield),
          help: 'Annual rent ÷ Purchase price',
          gold: false,
        },
        {
          label: 'Net Yield',
          value: formatPercent(results.netYield),
          help: 'Annual NOI ÷ Purchase price',
          gold: false,
        },
        {
          label: 'Monthly Cash Flow',
          value: formatCurrency(results.monthlyCashFlow),
          help: 'After all expenses + mortgage',
          gold: results.monthlyCashFlow > 0,
        },
        {
          label: 'Annual Cash Flow',
          value: formatCurrency(results.annualCashFlow),
          help: 'Monthly × 12',
          gold: results.annualCashFlow > 0,
        },
        {
          label: 'Equity',
          value: formatCurrency(results.equity),
          help: 'Current value − original mortgage',
          gold: results.equity > 0,
        },
        {
          label: 'Annual NOI',
          value: formatCurrency(results.annualNOI),
          help: 'Net operating income',
          gold: false,
        },
      ]
    : []

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-6">
        {/* Load from property */}
        {properties.length > 0 && (
          <div className="rounded-xl border border-dynasty-gold/20 bg-dynasty-gold/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-dynasty-gold" />
              <p className="text-sm font-medium text-dynasty-cream">Load from property</p>
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

        <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 p-6 space-y-4">
          <h2 className="font-serif text-lg font-semibold text-dynasty-cream">Inputs</h2>
          {inputFields.map(({ key, label, help }) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={key}>
                {label}
                {help && <span className="ml-1.5 text-dynasty-gray-400 font-normal">— {help}</span>}
              </Label>
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
            Clear all
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 p-6">
          <h2 className="font-serif text-lg font-semibold text-dynasty-cream mb-4">Results</h2>

          {!results ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <TrendingUp className="h-10 w-10 text-dynasty-gray-600 mb-3" strokeWidth={1} />
              <p className="text-sm text-dynasty-gray-400">
                Enter purchase price to see calculations
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {resultMetrics.map(({ label, value, help, gold }) => (
                <div
                  key={label}
                  className={`rounded-lg p-4 border ${
                    gold
                      ? 'border-dynasty-gold/20 bg-dynasty-gold/5'
                      : 'border-dynasty-gray-700 bg-dynasty-gray-800'
                  }`}
                >
                  <p className="text-xs text-dynasty-gray-400 uppercase tracking-wider">{label}</p>
                  <p
                    className={`font-mono text-lg font-semibold mt-1 ${
                      gold ? 'text-dynasty-gold' : 'text-dynasty-cream'
                    }`}
                  >
                    {value}
                  </p>
                  {help && <p className="text-xs text-dynasty-gray-400 mt-0.5">{help}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {results && (
          <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 p-5 text-xs text-dynasty-gray-400 space-y-1">
            <p className="font-semibold text-dynasty-gray-200 mb-2 text-sm">Key Benchmarks (Canadian market)</p>
            <p>Cap Rate &gt; 5% is generally considered good for residential</p>
            <p>Cash-on-Cash &gt; 8–10% indicates strong cash flow</p>
            <p>Monthly cash flow should be positive after all expenses</p>
            <p className="mt-2 text-dynasty-gray-600">
              * These calculations are estimates for planning purposes only. Consult a financial advisor for investment decisions.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
