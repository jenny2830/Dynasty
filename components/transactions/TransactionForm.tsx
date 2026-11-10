'use client'

import { useActionState, useState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { createTransaction, updateTransaction, type TxFormState } from '@/app/actions/transactions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/NumberInput'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EXPENSE_ONLY_CATEGORIES, INCOME_CATEGORIES } from '@/lib/constants'
import { useLocale } from '@/lib/locale-context'
import { categoryLabel, enumLabel } from '@/lib/i18n/labels'
import { translateKnownError } from '@/lib/i18n/translate'
import type { Transaction } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'

function SubmitButton({ label, className }: { label: string; className?: string }) {
  const { pending } = useFormStatus()
  const { t } = useLocale()
  return (
    <Button type="submit" disabled={pending} className={className}>
      {pending ? t('common.saving') : label}
    </Button>
  )
}

interface Property {
  id: string
  name: string
}

interface Unit {
  id: string
  unit_number: string
}

interface TransactionFormProps {
  mode: 'create' | 'edit'
  transaction?: Transaction
  properties: Property[]
  defaultPropertyId?: string
}

export function TransactionForm({
  mode,
  transaction,
  properties,
  defaultPropertyId,
}: TransactionFormProps) {
  const { t } = useLocale()
  const [txType, setTxType] = useState<'income' | 'expense'>(
    transaction?.type ?? 'expense'
  )
  const [selectedProperty, setSelectedProperty] = useState<string>(
    transaction?.property_id ?? defaultPropertyId ?? 'none'
  )
  const [units, setUnits] = useState<Unit[]>([])
  const [taxDeductible, setTaxDeductible] = useState(
    transaction?.is_tax_deductible ?? false
  )

  const action =
    mode === 'create'
      ? createTransaction
      : updateTransaction.bind(null, transaction!.id)

  const [state, formAction] = useActionState<TxFormState, FormData>(action, null)

  const lastPropertyIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (lastPropertyIdRef.current === selectedProperty) return
    lastPropertyIdRef.current = selectedProperty

    let cancelled = false
    if (!selectedProperty || selectedProperty === 'none') {
      // Schedule the clear off the effect body so it does not run synchronously.
      queueMicrotask(() => {
        if (!cancelled) setUnits([])
      })
      return () => {
        cancelled = true
      }
    }

    const supabase = createClient()
    supabase
      .from('units')
      .select('id, unit_number')
      .eq('property_id', selectedProperty)
      .order('unit_number')
      .then(({ data }) => {
        if (!cancelled) setUnits(data ?? [])
      })
    return () => {
      cancelled = true
    }
  }, [selectedProperty])

  const categories = txType === 'income' ? INCOME_CATEGORIES : EXPENSE_ONLY_CATEGORIES

  const today = new Date().toISOString().split('T')[0]

  return (
    <form action={formAction} className="space-y-7">
      {state?.errors?._form && (
        <div className="rounded-[1px] border border-[rgba(183,110,121,0.3)] bg-[rgba(183,110,121,0.08)] px-4 py-3">
          <p className="font-sans text-[12px] font-light text-dynasty-rose-light">
            {translateKnownError(state.errors._form[0], t)}
          </p>
        </div>
      )}

      {/* Type toggle — sharp art deco segmented control */}
      <div className="space-y-2">
        <Label>{t('tx.typeLabel')} *</Label>
        <div className="tx-type-segment flex overflow-hidden rounded-[1px] border border-[var(--card-border-color)]">
          {(['expense', 'income'] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              aria-pressed={txType === kind}
              onClick={() => setTxType(kind)}
              className={`flex-1 py-3 font-sans text-[10px] font-light uppercase tracking-[0.22em] transition-colors ${
                txType === kind
                  ? kind === 'income'
                    ? 'bg-[var(--badge-pos-bg)] text-[var(--badge-pos-text)]'
                    : 'bg-[var(--badge-neg-bg)] text-[var(--badge-neg-text)]'
                  : 'text-dynasty-gray-500 hover:text-dynasty-gold hover:bg-[var(--table-row-hover-bg)]'
              }`}
            >
              {enumLabel(kind, t)}
            </button>
          ))}
        </div>
        <input type="hidden" name="type" value={txType} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">{t('tx.amountCad')} *</Label>
          <NumberInput
            id="amount"
            name="amount"
            defaultValue={transaction?.amount ?? null}
            prefix="$"
            decimals={2}
            placeholder="1,500.00"
            required
          />
          {state?.errors?.amount && (
            <p className="font-sans text-[11px] font-light text-dynasty-rose-light">
              {translateKnownError(state.errors.amount[0], t)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="transaction_date">{t('common.date')} *</Label>
          <Input
            id="transaction_date"
            name="transaction_date"
            type="date"
            defaultValue={transaction?.transaction_date ?? today}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">{t('common.category')} *</Label>
          <Select
            name="category"
            defaultValue={transaction?.category}
            key={txType}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder={t('tx.selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {categoryLabel(c, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state?.errors?.category && (
            <p className="font-sans text-[11px] font-light text-dynasty-rose-light">
              {translateKnownError(state.errors.category[0], t)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="property_id">{t('common.property')}</Label>
          <Select
            name="property_id"
            value={selectedProperty}
            onValueChange={setSelectedProperty}
          >
            <SelectTrigger id="property_id">
              <SelectValue placeholder={t('tx.selectProperty')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('tx.noPropertyOption')}</SelectItem>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {units.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="unit_id">{t('common.unit')}</Label>
            <Select name="unit_id" defaultValue={transaction?.unit_id ?? 'none'}>
              <SelectTrigger id="unit_id">
                <SelectValue placeholder={t('tx.selectUnit')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('tx.noUnit')}</SelectItem>
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {t('units.label', { number: u.unit_number })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('common.description')}</Label>
        <Textarea
          id="description"
          name="description"
          placeholder={t('tx.descriptionPlaceholder')}
          defaultValue={transaction?.description ?? ''}
          rows={2}
        />
      </div>

      {txType === 'expense' && (
        <div className="flex items-center gap-3">
          <Checkbox
            id="is_tax_deductible"
            name="is_tax_deductible"
            checked={taxDeductible}
            onCheckedChange={(v) => setTaxDeductible(Boolean(v))}
          />
          <Label htmlFor="is_tax_deductible" className="cursor-pointer normal-case tracking-[0.06em] text-[12px] text-dynasty-gray-300">
            {t('tx.taxDeductible')}
          </Label>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-[var(--divider-c)]">
        <SubmitButton label={mode === 'create' ? t('tx.add') : t('tx.saveChanges')} className="w-full sm:w-auto" />
        <Button type="button" variant="outline" onClick={() => window.history.back()} className="w-full sm:w-auto">
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  )
}
