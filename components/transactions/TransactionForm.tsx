'use client'

import { useActionState, useState, useEffect } from 'react'
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

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
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
    transaction?.property_id ?? defaultPropertyId ?? ''
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

  // Load units when property changes
  useEffect(() => {
    if (!selectedProperty) {
      setUnits([])
      return
    }
    const supabase = createClient()
    supabase
      .from('units')
      .select('id, unit_number')
      .eq('property_id', selectedProperty)
      .order('unit_number')
      .then(({ data }) => setUnits(data ?? []))
  }, [selectedProperty])

  const categories =
    txType === 'income'
      ? INCOME_CATEGORIES
      : EXPENSE_CATEGORIES.filter((c) => !(['Rental income', 'Other income'] as string[]).includes(c))

  const today = new Date().toISOString().split('T')[0]

  return (
    <form action={formAction} className="space-y-6">
      {state?.errors?._form && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{state.errors._form[0]}</p>
        </div>
      )}

      {/* Type toggle */}
      <div className="space-y-1.5">
        <Label>Transaction type *</Label>
        <div className="flex rounded-lg overflow-hidden border border-dynasty-gray-600">
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTxType(t)}
              className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${
                txType === t
                  ? t === 'income'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                  : 'text-dynasty-gray-400 hover:text-dynasty-cream hover:bg-dynasty-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <input type="hidden" name="type" value={txType} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Amount */}
        <div className="space-y-1.5">
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
            <p className="text-xs text-red-400">{state.errors.amount[0]}</p>
          )}
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <Label htmlFor="transaction_date">Date *</Label>
          <Input
            id="transaction_date"
            name="transaction_date"
            type="date"
            defaultValue={transaction?.transaction_date ?? today}
            required
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
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
            <p className="text-xs text-red-400">{state.errors.category[0]}</p>
          )}
        </div>

        {/* Property */}
        <div className="space-y-1.5">
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
              <SelectItem value="">No property</SelectItem>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Unit (only if property selected and has units) */}
        {units.length > 0 && (
          <div className="space-y-1.5">
            <Label htmlFor="unit_id">Unit</Label>
            <Select name="unit_id" defaultValue={transaction?.unit_id ?? ''}>
              <SelectTrigger id="unit_id">
                <SelectValue placeholder="Select unit (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No specific unit</SelectItem>
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

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Optional description…"
          defaultValue={transaction?.description ?? ''}
          rows={2}
        />
      </div>

      {/* Tax deductible */}
      {txType === 'expense' && (
        <div className="flex items-center gap-3">
          <Checkbox
            id="is_tax_deductible"
            name="is_tax_deductible"
            checked={taxDeductible}
            onCheckedChange={(v) => setTaxDeductible(Boolean(v))}
          />
          <Label htmlFor="is_tax_deductible" className="cursor-pointer">
            Tax deductible expense
          </Label>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <SubmitButton label={mode === 'create' ? 'Add transaction' : 'Save changes'} />
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
