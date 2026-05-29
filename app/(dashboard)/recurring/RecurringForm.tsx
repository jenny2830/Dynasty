'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import {
  createRecurringPayment,
  updateRecurringPayment,
  type RecurringFormState,
} from '@/app/actions/recurring'
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
import { EXPENSE_ONLY_CATEGORIES, PAYMENT_FREQUENCIES } from '@/lib/constants'
import type { RecurringPayment } from '@/types/database.types'

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

interface RecurringFormProps {
  mode: 'create' | 'edit'
  payment?: RecurringPayment
  properties: Property[]
}

export function RecurringForm({ mode, payment, properties }: RecurringFormProps) {
  const action =
    mode === 'create'
      ? createRecurringPayment
      : updateRecurringPayment.bind(null, payment!.id)

  const [state, formAction] = useActionState<RecurringFormState, FormData>(action, null)

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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Payment Name *</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Property Insurance"
            defaultValue={payment?.name}
            required
          />
          {state?.errors?.name && (
            <p className="font-sans text-[11px] font-light text-dynasty-rose-light">
              {state.errors.name[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="property_id">Property *</Label>
          <Select name="property_id" defaultValue={payment?.property_id ?? ''}>
            <SelectTrigger id="property_id">
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state?.errors?.property_id && (
            <p className="font-sans text-[11px] font-light text-dynasty-rose-light">
              {state.errors.property_id[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select name="category" defaultValue={payment?.category}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_ONLY_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (CAD) *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="250.00"
            defaultValue={payment?.amount ?? ''}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency</Label>
          <Select name="frequency" defaultValue={payment?.frequency ?? 'monthly'}>
            <SelectTrigger id="frequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_FREQUENCIES.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="next_due_date">Next Due Date *</Label>
          <Input
            id="next_due_date"
            name="next_due_date"
            type="date"
            defaultValue={payment?.next_due_date ?? today}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminder_days_before">Remind Me (Days Before)</Label>
          <Input
            id="reminder_days_before"
            name="reminder_days_before"
            type="number"
            min="0"
            max="30"
            defaultValue={payment?.reminder_days_before ?? 5}
          />
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="auto_log_transaction"
          name="auto_log_transaction"
          defaultChecked={payment?.auto_log_transaction ?? false}
          className="mt-0.5"
        />
        <div>
          <Label htmlFor="auto_log_transaction" className="cursor-pointer normal-case tracking-[0.06em] text-[12px] text-dynasty-gray-300">
            Auto-log transaction when marked as paid
          </Label>
          <p className="mt-1 font-sans text-[11px] font-light tracking-[0.04em] text-dynasty-gray-500">
            Automatically creates an expense transaction on the due date
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Optional notes…"
          defaultValue={payment?.notes ?? ''}
          rows={2}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-[rgba(201,168,76,0.08)]">
        <SubmitButton label={mode === 'create' ? 'Add Payment' : 'Save Changes'} className="w-full sm:w-auto" />
        <Button type="button" variant="outline" onClick={() => window.history.back()} className="w-full sm:w-auto">
          Cancel
        </Button>
      </div>
    </form>
  )
}
