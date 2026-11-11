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
import {
  COUNTRIES,
  getCurrencyForCountry,
  getRegionLabel,
  getRegionOptions,
  normalizeRegion,
} from '@/lib/geo'
import { PROPERTY_TYPES, PROPERTY_SUBTYPES, PROPERTY_STATUSES } from '@/lib/constants'
import { useLocale } from '@/lib/locale-context'
import { countryLabel, enumLabel, regionDisplay, regionKindLabel } from '@/lib/i18n/labels'
import { translateKnownError } from '@/lib/i18n/translate'
import { NumberInput } from '@/components/ui/NumberInput'
import type { Property } from '@/types/database.types'

function SubmitButton({ label, className }: { label: string; className?: string }) {
  const { pending } = useFormStatus()
  const { t } = useLocale()
  return (
    <Button type="submit" disabled={pending} className={className}>
      {pending ? t('common.saving') : label}
    </Button>
  )
}

function FormSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 pb-2 border-b border-[var(--divider-c)] font-sans text-[9px] font-light uppercase tracking-[0.2em] text-dynasty-gray-500">
      {children}
    </h2>
  )
}

interface PropertyFormProps {
  mode: 'create' | 'edit'
  property?: Property
}

export function PropertyForm({ mode, property }: PropertyFormProps) {
  const { t, locale } = useLocale()
  const initialCountry = property?.country ?? 'CA'
  const [type, setType] = useState<string>(property?.type ?? 'rental')
  const [country, setCountry] = useState<string>(initialCountry)
  const [province, setProvince] = useState<string>(() =>
    normalizeRegion(initialCountry, property?.province) || '',
  )
  const [status, setStatus] = useState<string>(property?.status ?? 'active')
  const [propertySubtype, setPropertySubtype] = useState<string>(
    property?.property_subtype ?? 'residential',
  )

  const regionLabel = regionKindLabel(getRegionLabel(country), t)
  const regions = getRegionOptions(country, province)
  const currencyLabel = getCurrencyForCountry(country)

  const action =
    mode === 'create'
      ? createProperty
      : updateProperty.bind(null, property!.id)

  const [state, formAction] = useActionState<PropertyFormState, FormData>(action, null)

  return (
    <form action={formAction} className="space-y-9">
      <input type="hidden" name="country" value={country} />
      <input type="hidden" name="province" value={province} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="property_subtype" value={propertySubtype} />

      {state?.errors?._form && (
        <div className="rounded-[1px] border border-[rgba(183,110,121,0.3)] bg-[rgba(183,110,121,0.08)] px-4 py-3">
          <p className="font-sans text-[12px] font-light text-dynasty-rose-light">
            {translateKnownError(state.errors._form[0], t)}
          </p>
        </div>
      )}

      <section>
        <FormSectionLabel>{t('properties.basic')}</FormSectionLabel>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">{t('properties.name')} *</Label>
            <Input
              id="name"
              name="name"
              placeholder={t('properties.namePlaceholder')}
              defaultValue={property?.name}
              required
            />
            {state?.errors?.name && (
              <p className="font-sans text-[11px] font-light text-dynasty-rose-light">
                {translateKnownError(state.errors.name[0], t)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{t('common.status')}</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder={t('properties.selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {enumLabel(s.value, t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{t('properties.propertyType')} *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue placeholder={t('properties.selectType')} />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {enumLabel(option.value, t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="property_subtype">{t('properties.subtype')} *</Label>
            <Select value={propertySubtype} onValueChange={setPropertySubtype}>
              <SelectTrigger id="property_subtype">
                <SelectValue placeholder={t('properties.selectSubtype')} />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_SUBTYPES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {enumLabel(s.value, t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="num_units">{t('properties.numUnits')}</Label>
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

      <section>
        <FormSectionLabel>{t('properties.addressSection')}</FormSectionLabel>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="address">{t('properties.street')} *</Label>
            <Input
              id="address"
              name="address"
              placeholder={t('properties.streetPlaceholder')}
              defaultValue={property?.address}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">{t('properties.city')} *</Label>
            <Input
              id="city"
              name="city"
              placeholder={t('properties.cityPlaceholder')}
              defaultValue={property?.city}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="province">{regionLabel} *</Label>
            <Select
              value={province || undefined}
              onValueChange={setProvince}
            >
              <SelectTrigger id="province">
                <SelectValue placeholder={t('properties.selectRegion', { region: regionLabel.toLowerCase() })} />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {regionDisplay(r, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state?.errors?.province && (
              <p className="font-sans text-[11px] font-light text-dynasty-rose-light">
                {translateKnownError(state.errors.province[0], t)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code">{t('properties.postal')}</Label>
            <Input
              id="postal_code"
              name="postal_code"
              placeholder="M5V 3A8"
              defaultValue={property?.postal_code ?? ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">{t('properties.country')}</Label>
            <Select
              value={country}
              onValueChange={(value) => {
                setCountry(value)
                setProvince('')
              }}
            >
              <SelectTrigger id="country">
                <SelectValue placeholder={t('properties.selectCountry')} />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {countryLabel(c.code, c.name, t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section>
        <FormSectionLabel>{t('properties.financial')}</FormSectionLabel>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="purchase_price">{t('properties.purchaseWithCurrency', { currency: currencyLabel })}</Label>
            <NumberInput
              id="purchase_price"
              name="purchase_price"
              defaultValue={property?.purchase_price ?? null}
              prefix="$"
              decimals={2}
              placeholder="500,000.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_value">{t('properties.currentWithCurrency', { currency: currencyLabel })}</Label>
            <NumberInput
              id="current_value"
              name="current_value"
              defaultValue={property?.current_value ?? null}
              prefix="$"
              decimals={2}
              placeholder="600,000.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mortgage_balance">{t('properties.mortgageBalanceWithCurrency', { currency: currencyLabel })}</Label>
            <NumberInput
              id="mortgage_balance"
              name="mortgage_balance"
              defaultValue={property?.mortgage_balance ?? null}
              prefix="$"
              decimals={2}
              placeholder="350,000.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_mortgage">{t('properties.monthlyMortgageWithCurrency', { currency: currencyLabel })}</Label>
            <NumberInput
              id="monthly_mortgage"
              name="monthly_mortgage"
              defaultValue={property?.monthly_mortgage ?? null}
              prefix="$"
              decimals={2}
              placeholder="2,100.00"
            />
          </div>

          {type === 'condo' && (
            <div className="space-y-2">
              <Label htmlFor="condo_fee">{t('properties.condoFeeWithCurrency', { currency: currencyLabel })}</Label>
              <NumberInput
                id="condo_fee"
                name="condo_fee"
                defaultValue={property?.condo_fee ?? null}
                prefix="$"
                decimals={2}
                placeholder="450.00"
              />
            </div>
          )}

          {type === 'strata' && (
            <div className="space-y-2">
              <Label htmlFor="strata_fee">{t('properties.strataFeeWithCurrency', { currency: currencyLabel })}</Label>
              <NumberInput
                id="strata_fee"
                name="strata_fee"
                defaultValue={property?.strata_fee ?? null}
                prefix="$"
                decimals={2}
                placeholder="350.00"
              />
            </div>
          )}
        </div>
      </section>

      <section>
        <FormSectionLabel>{t('common.notes')}</FormSectionLabel>
        <div className="space-y-2">
          <Label htmlFor="notes">{t('properties.additionalNotes')}</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder={t('properties.notesPlaceholder')}
            defaultValue={property?.notes ?? ''}
            rows={3}
          />
        </div>
      </section>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <SubmitButton label={mode === 'create' ? t('properties.add') : t('properties.saveChanges')} className="w-full sm:w-auto" />
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          className="w-full sm:w-auto"
        >
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  )
}
