'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createProperty, updateProperty, type PropertyFormState } from '@/app/actions/properties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CANADIAN_PROVINCES, PROPERTY_TYPES, PROPERTY_SUBTYPES, PROPERTY_STATUSES } from '@/lib/constants'
import type { Property } from '@/types/database.types'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : label}
    </Button>
  )
}

interface PropertyFormProps {
  mode: 'create' | 'edit'
  property?: Property
}

export function PropertyForm({ mode, property }: PropertyFormProps) {
  const [type, setType] = useState<string>(property?.type ?? 'rental')

  const action =
    mode === 'create'
      ? createProperty
      : updateProperty.bind(null, property!.id)

  const [state, formAction] = useActionState<PropertyFormState, FormData>(action, null)

  return (
    <form action={formAction} className="space-y-8">
      {state?.errors?._form && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{state.errors._form[0]}</p>
        </div>
      )}

      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="font-serif text-lg font-semibold text-dynasty-cream border-b border-dynasty-gray-700 pb-2">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Property name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. 123 Main St Unit B"
              defaultValue={property?.name}
              required
            />
            {state?.errors?.name && (
              <p className="text-xs text-red-400">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={property?.status ?? 'active'}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type">Property type *</Label>
            <Select
              name="type"
              defaultValue={property?.type ?? 'rental'}
              onValueChange={setType}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="property_subtype">Subtype *</Label>
            <Select name="property_subtype" defaultValue={property?.property_subtype ?? 'residential'}>
              <SelectTrigger id="property_subtype">
                <SelectValue placeholder="Select subtype" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_SUBTYPES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="num_units">Number of units</Label>
            <Input
              id="num_units"
              name="num_units"
              type="number"
              min="1"
              defaultValue={property?.num_units ?? 1}
            />
          </div>
        </div>
      </section>

      {/* Address */}
      <section className="space-y-4">
        <h2 className="font-serif text-lg font-semibold text-dynasty-cream border-b border-dynasty-gray-700 pb-2">
          Address
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="address">Street address *</Label>
            <Input
              id="address"
              name="address"
              placeholder="123 Main Street"
              defaultValue={property?.address}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              name="city"
              placeholder="Toronto"
              defaultValue={property?.city}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="province">Province *</Label>
            <Select name="province" defaultValue={property?.province ?? 'ON'}>
              <SelectTrigger id="province">
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {CANADIAN_PROVINCES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="postal_code">Postal code</Label>
            <Input
              id="postal_code"
              name="postal_code"
              placeholder="M5V 3A8"
              defaultValue={property?.postal_code ?? ''}
            />
          </div>
        </div>
      </section>

      {/* Financials */}
      <section className="space-y-4">
        <h2 className="font-serif text-lg font-semibold text-dynasty-cream border-b border-dynasty-gray-700 pb-2">
          Financial Details
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="purchase_price">Purchase price (CAD)</Label>
            <Input
              id="purchase_price"
              name="purchase_price"
              type="number"
              min="0"
              step="1000"
              placeholder="500000"
              defaultValue={property?.purchase_price ?? ''}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="current_value">Current value (CAD)</Label>
            <Input
              id="current_value"
              name="current_value"
              type="number"
              min="0"
              step="1000"
              placeholder="600000"
              defaultValue={property?.current_value ?? ''}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mortgage_balance">Mortgage balance (CAD)</Label>
            <Input
              id="mortgage_balance"
              name="mortgage_balance"
              type="number"
              min="0"
              step="100"
              placeholder="350000"
              defaultValue={property?.mortgage_balance ?? ''}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="monthly_mortgage">Monthly mortgage (CAD)</Label>
            <Input
              id="monthly_mortgage"
              name="monthly_mortgage"
              type="number"
              min="0"
              step="10"
              placeholder="2100"
              defaultValue={property?.monthly_mortgage ?? ''}
            />
          </div>

          {type === 'condo' && (
            <div className="space-y-1.5">
              <Label htmlFor="condo_fee">Monthly condo fee (CAD)</Label>
              <Input
                id="condo_fee"
                name="condo_fee"
                type="number"
                min="0"
                step="10"
                placeholder="450"
                defaultValue={property?.condo_fee ?? ''}
              />
            </div>
          )}

          {type === 'strata' && (
            <div className="space-y-1.5">
              <Label htmlFor="strata_fee">Monthly strata fee (CAD)</Label>
              <Input
                id="strata_fee"
                name="strata_fee"
                type="number"
                min="0"
                step="10"
                placeholder="350"
                defaultValue={property?.strata_fee ?? ''}
              />
            </div>
          )}
        </div>
      </section>

      {/* Notes */}
      <section className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Any additional notes about this property…"
            defaultValue={property?.notes ?? ''}
            rows={3}
          />
        </div>
      </section>

      <div className="flex gap-3 pt-2">
        <SubmitButton label={mode === 'create' ? 'Add property' : 'Save changes'} />
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
