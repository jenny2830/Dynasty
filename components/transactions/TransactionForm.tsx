'use client'

import { useActionState, useState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { createTransaction, updateTransaction, type TxFormState } from '@/app/actions/transactions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/constants'
import type { Transaction } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'

function SubmitButton({ label, className }: { label: string; className?: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className={className}>
      {pending ? 'Saving…' : label}
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

  const categories =
    txType === 'income'
      ? INCOME_CATEGORIES
      : EXPENSE_CATEGORIES.filter((c) => !(['Rental income', 'Other income'] as string[]).includes(c))

  const today = new Date().toISOString().split('T')[0]

  return (
    <form action={formAction} className="space-y-7">
      {state?.errors?._form && (
        <div className="rounded-[1px] border border-[rgba(183,110,121,0.3)] bg-[rgba(183,110,121,0.08)] px-4 py-3">
          <p className="font-sans text-[12px] font-light text-dynasty-rose-light">
            {state.errors._form[0]}
          </p>
        </div>
      )}

      {/* Type toggle — sharp art deco segmented control */}
      <div className="space-y-2">
        <Label>Transaction Type *</Label>
        <div className="tx-type-segment flex overflow-hidden rounded-[1px] border border-[rgba(201,168,76,0.15)]">
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={txType === t}
              onClick={() => setTxType(t)}
              className={`flex-1 py-3 font-sans text-[10px] font-light uppercase tracking-[0.22em] transition-colors ${
                txType === t
                  ? t === 'income'
                    ? 'bg-[rgba(201,168,76,0.08)] text-dynasty-gold'
                    : 'bg-[rgba(183,110,121,0.08)] text-dynasty-rose-gold'
                  : 'text-dynasty-gray-500 hover:text-dynasty-gold hover:bg-[rgba(201,168,76,0.04)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <input type="hidden" name="type" value={txType} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (CAD) *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="1500.00"
            defaultValue={transaction?.amount ?? ''}
            required
          />
          {state?.errors?.amount && (
            <p className="font-sans text-[11px] font-light text-dynasty-rose-light">
              {state.errors.amount[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="transaction_date">Date *</Label>
          <Input
            id="transaction_date"
            name="transaction_date"
            type="date"
            defaultValue={transaction?.transaction_date ?? today}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            name="category"
            defaultValue={transaction?.category}
            key={txType}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state?.errors?.category && (
            <p className="font-sans text-[11px] font-light text-dynasty-rose-light">
              {state.errors.category[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="property_id">Property</Label>
          <Select
            name="property_id"
            value={selectedProperty}
            onValueChange={setSelectedProperty}
          >
            <SelectTrigger id="property_id">
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No property</SelectItem>
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
            <Label htmlFor="unit_id">Unit</Label>
            <Select name="unit_id" defaultValue={transaction?.unit_id ?? 'none'}>
              <SelectTrigger id="unit_id">
                <SelectValue placeholder="Select unit (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific unit</SelectItem>
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    Unit {u.unit_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Optional description…"
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
            Tax deductible expense
          </Label>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-[rgba(201,168,76,0.08)]">
        <SubmitButton label={mode === 'create' ? 'Add Transaction' : 'Save Changes'} className="w-full sm:w-auto" />
        <Button type="button" variant="outline" onClick={() => window.history.back()} className="w-full sm:w-auto">
          Cancel
        </Button>
      </div>
    </form>
  )
}
