'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, Building2 } from 'lucide-react'
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
import { formatPercent } from '@/lib/utils'
import { NumberInput } from '@/components/ui/NumberInput'
import { useAppTheme } from '@/lib/theme-context'
import { useFormatters, useLocale } from '@/lib/locale-context'
import { ProfitabilityChart } from '@/components/roi/ProfitabilityChart'

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
  const { theme } = useAppTheme()
  const { t } = useLocale()
  const { money } = useFormatters()
  const [inputs, setInputs] = useState<ROIInputs>(EMPTY_INPUTS)

  const set = (key: keyof ROIInputs) => (val: number | null) =>
    setInputs((prev) => ({ ...prev, [key]: val ?? 0 }))

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
    { key: 'purchasePrice', label: t('roi.purchase'), help: t('roi.purchaseHelp') },
    { key: 'downPayment', label: t('roi.down'), help: t('roi.downHelp') },
    { key: 'closingCosts', label: t('roi.closing'), help: t('roi.closingHelp') },
    { key: 'monthlyRent', label: t('roi.rent'), help: t('roi.rentHelp') },
    { key: 'monthlyExpenses', label: t('roi.opex'), help: t('roi.opexHelp') },
    { key: 'monthlyMortgage', label: t('roi.mortgage'), help: t('roi.mortgageHelp') },
    { key: 'currentValue', label: t('roi.marketValue'), help: t('roi.marketHelp') },
  ]

  const headlineMetrics = results
    ? [
        {
          label: t('roi.capRate'),
          value: formatPercent(results.capRate),
          help: t('roi.capHelp'),
          positive: results.capRate > 0,
        },
        {
          label: t('roi.cashOnCash'),
          value: formatPercent(results.cashOnCash),
          help: t('roi.cashHelp'),
          positive: results.cashOnCash > 0,
        },
      ]
    : []

  const subMetrics = results
    ? [
        { label: t('roi.grossYield'), value: formatPercent(results.grossYield), positive: results.grossYield > 0 },
        { label: t('roi.netYield'), value: formatPercent(results.netYield), positive: results.netYield > 0 },
        { label: t('roi.monthlyCashFlow'), value: money(results.monthlyCashFlow), positive: results.monthlyCashFlow > 0 },
        { label: t('roi.annualCashFlow'), value: money(results.annualCashFlow), positive: results.annualCashFlow > 0 },
        { label: t('roi.equity'), value: money(results.equity), positive: results.equity > 0 },
        { label: t('roi.annualNoi'), value: money(results.annualNOI), positive: results.annualNOI > 0 },
      ]
    : []

  return (
    <>
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Inputs panel */}
      <div className="space-y-6">
        {properties.length > 0 && (
          <div
            className="rounded-[2px] px-5 py-4"
            style={{ border: `1px solid ${theme.accent}2E`, background: `${theme.accent}0A` }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5" strokeWidth={1.2} style={{ color: theme.accent }} />
              <p className="font-sans text-[10px] font-light uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
                {t('roi.loadFrom')}
              </p>
            </div>
            <Select onValueChange={loadFromProperty}>
              <SelectTrigger>
                <SelectValue placeholder={t('roi.selectProperty')} />
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
          <h2
            className="pb-3 font-sans text-[9px] font-light uppercase tracking-[0.2em]"
            style={{ borderBottom: `1px solid ${theme.dividerColor}`, color: theme.textMuted }}
          >
            {t('roi.inputs')}
          </h2>
          {inputFields.map(({ key, label, help }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              {help && (
                <p className="font-sans text-[11px] font-light tracking-[0.04em] text-dynasty-gray-500 -mt-1">
                  {help}
                </p>
              )}
              <NumberInput
                id={key}
                value={inputs[key] || null}
                onChange={set(key)}
                prefix="$"
                decimals={2}
                placeholder="0.00"
              />
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputs(EMPTY_INPUTS)}
            className="mt-2"
          >
            {t('common.clearAll')}
          </Button>
        </Section>
      </div>

      {/* Results panel */}
      <div className="space-y-5">
        <Section variant="warm" className="px-7 py-6">
          <h2
            className="mb-5 pb-3 font-sans text-[9px] font-light uppercase tracking-[0.2em]"
            style={{ borderBottom: `1px solid ${theme.dividerColor}`, color: theme.textMuted }}
          >
            {t('roi.results')}
          </h2>

          {!results ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <TrendingUp className="h-8 w-8 text-dynasty-gold/15" strokeWidth={1} />
              <p className="mt-4 font-serif text-[16px] font-medium tracking-[0.02em] text-dynasty-gray-300">
                {t('roi.awaiting')}
              </p>
              <p className="mt-1.5 font-sans text-[11px] font-light tracking-[0.06em] text-dynasty-gray-500">
                {t('roi.awaitingHelp')}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Headline metrics — Bebas display */}
              <div className="grid grid-cols-2 gap-4">
                {headlineMetrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-[1px] px-5 py-4"
                    style={{ border: `1px solid ${theme.accent}1F`, background: `${theme.accent}0A` }}
                  >
                    <p className="font-sans text-[9px] font-light uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>
                      {m.label}
                    </p>
                    <p
                      className="mt-2 font-display text-[44px] leading-none tracking-[0.04em]"
                      style={{ color: m.positive ? theme.accent : theme.valueNegative }}
                    >
                      {m.value}
                    </p>
                    {m.help && (
                      <p className="mt-2 font-sans text-[10px] font-light tracking-[0.04em]" style={{ color: theme.textMuted }}>
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
                    className="rounded-[1px] px-4 py-3"
                    style={{ border: `1px solid ${theme.accent}0F`, background: theme.inputBg }}
                  >
                    <p className="font-sans text-[9px] font-light uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>
                      {m.label}
                    </p>
                    <p
                      className="mt-1 font-mono text-[16px] font-medium tracking-tight"
                      style={{ color: m.positive ? theme.accent : theme.valueNegative }}
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
            <p className="mb-3 font-sans text-[9px] font-light uppercase tracking-[0.2em]" style={{ color: `${theme.accent}CC` }}>
              <span className="mr-2 text-[6px] leading-none" style={{ color: `${theme.accent}80` }}>◆</span>
              {t('roi.benchmarks')}
            </p>
            <ul className="space-y-1.5 font-sans text-[12px] font-light tracking-[0.02em]" style={{ color: theme.textSecondary }}>
              <li>{t('roi.benchCap')}</li>
              <li>{t('roi.benchCoc')}</li>
              <li>{t('roi.benchFlow')}</li>
            </ul>
            <p className="mt-3 font-sans text-[10px] font-light italic tracking-[0.04em]" style={{ color: theme.textMuted }}>
              {t('roi.disclaimer')}
            </p>
          </Section>
        )}
      </div>
    </div>

    {/* ── Full-width Profitability Charts (only when results are available) ── */}
    {results && (
      <div style={{ marginTop: '32px' }}>
        <ProfitabilityChart results={{
          purchasePrice:    inputs.purchasePrice,
          downPayment:      inputs.downPayment,
          closingCosts:     inputs.closingCosts,
          monthlyRent:      inputs.monthlyRent,
          monthlyExpenses:  inputs.monthlyExpenses,
          monthlyMortgage:  inputs.monthlyMortgage,
          currentValue:     inputs.currentValue,
          monthlyCashFlow:  results.monthlyCashFlow,
          annualCashFlow:   results.annualCashFlow,
          capRate:          results.capRate,
          cashOnCash:       results.cashOnCash,
          grossYield:       results.grossYield,
          netYield:         results.netYield,
          equity:           results.equity,
          totalInvestment:  results.totalCashInvested,
        }} />
      </div>
    )}
    </>
  )
}
