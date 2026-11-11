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
import { EXPENSE_ONLY_CATEGORIES, PAYMENT_FREQUENCIES } from '@/lib/constants'
import { useLocale } from '@/lib/locale-context'
import { categoryLabel, enumLabel } from '@/lib/i18n/labels'
import { translateKnownError } from '@/lib/i18n/translate'
import type { RecurringPayment } from '@/types/database.types'

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

interface RecurringFormProps {
  mode: 'create' | 'edit'
  payment?: RecurringPayment
  properties: Property[]
}

export function RecurringForm({ mode, payment, properties }: RecurringFormProps) {
  const { t } = useLocale()
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
            {translateKnownError(state.errors._form[0], t)}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{t('recurring.paymentName')} *</Label>
          <Input
            id="name"
            name="name"
            placeholder={t('recurring.namePlaceholder')}
            defaultValue={payment?.name}
            required
          />
          {state?.errors?.name && (
            <p className="font-sans text-[11px] font-light text-dynasty-rose-light">
              {translateKnownError(state.errors.name[0], t)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="property_id">{t('common.property')} *</Label>
          <Select name="property_id" defaultValue={payment?.property_id ?? ''}>
            <SelectTrigger id="property_id">
              <SelectValue placeholder={t('tx.selectProperty')} />
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
              {translateKnownError(state.errors.property_id[0], t)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">{t('common.category')} *</Label>
          <Select name="category" defaultValue={payment?.category}>
            <SelectTrigger id="category">
              <SelectValue placeholder={t('tx.selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_ONLY_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {categoryLabel(c, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">{t('recurring.amountCad')} *</Label>
          <NumberInput
            id="amount"
            name="amount"
            defaultValue={payment?.amount ?? null}
            prefix="$"
            decimals={2}
            placeholder="250.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">{t('recurring.frequency')}</Label>
          <Select name="frequency" defaultValue={payment?.frequency ?? 'monthly'}>
            <SelectTrigger id="frequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_FREQUENCIES.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {enumLabel(f.value, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="next_due_date">{t('recurring.nextDue')} *</Label>
          <Input
            id="next_due_date"
            name="next_due_date"
            type="date"
            defaultValue={payment?.next_due_date ?? today}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminder_days_before">{t('recurring.remindDays')}</Label>
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
            {t('recurring.autoLog')}
          </Label>
          <p className="mt-1 font-sans text-[11px] font-light tracking-[0.04em] text-dynasty-gray-500">
            {t('recurring.autoLogHelp')}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t('common.notes')}</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder={t('recurring.notesPlaceholder')}
          defaultValue={payment?.notes ?? ''}
          rows={2}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-[var(--divider-c)]">
        <SubmitButton label={mode === 'create' ? t('recurring.add') : t('recurring.saveChanges')} className="w-full sm:w-auto" />
        <Button type="button" variant="outline" onClick={() => window.history.back()} className="w-full sm:w-auto">
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  )
}
