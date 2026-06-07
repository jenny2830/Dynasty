'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { PLAN_FEATURES, type PlanId } from '@/lib/plans'

const propertySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  postal_code: z.string().optional().nullable(),
  country: z.string().min(2).default('CA'),
  type: z.enum(['rental', 'condo', 'strata']),
  property_subtype: z.enum(['residential', 'commercial']),
  num_units: z.coerce.number().int().min(1).default(1),
  purchase_price: z.coerce.number().min(0).optional().nullable(),
  current_value: z.coerce.number().min(0).optional().nullable(),
  mortgage_balance: z.coerce.number().min(0).optional().nullable(),
  monthly_mortgage: z.coerce.number().min(0).optional().nullable(),
  condo_fee: z.coerce.number().min(0).optional().nullable(),
  strata_fee: z.coerce.number().min(0).optional().nullable(),
  status: z.enum(['active', 'vacant', 'inactive']).default('active'),
  notes: z.string().optional().nullable(),
})

export type PropertyFormState = {
  errors?: Record<string, string[]>
  message?: string
} | null

async function getLandlordId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: landlord } = await supabase
    .from('landlords')
    .select('id, plan')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!landlord) throw new Error('Landlord profile not found')
  return { supabase, landlordId: landlord.id, plan: (landlord.plan ?? 'free') as PlanId }
}

function nullifyEmpty(val: unknown) {
  if (val === '' || val === undefined) return null
  return val
}

export async function createProperty(
  _prevState: PropertyFormState,
  formData: FormData
): Promise<PropertyFormState> {
  let landlordId: string
  let plan: PlanId
  let supabase: Awaited<ReturnType<typeof createClient>>
  try {
    ;({ supabase, landlordId, plan } = await getLandlordId())
  } catch (e) {
    return { errors: { _form: [(e as Error).message] } }
  }

  // Enforce per-plan property limit
  const maxProperties = PLAN_FEATURES[plan].maxProperties
  const { count } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('landlord_id', landlordId)
  if ((count ?? 0) >= maxProperties) {
    return {
      errors: {
        _form: [
          `Your ${plan} plan allows up to ${maxProperties} ${maxProperties === 1 ? 'property' : 'properties'}. Upgrade to add more.`,
        ],
      },
    }
  }

  const raw = {
    name: formData.get('name'),
    address: formData.get('address'),
    city: formData.get('city'),
    province: formData.get('province'),
    postal_code: nullifyEmpty(formData.get('postal_code')),
    country: formData.get('country') || 'CA',
    type: formData.get('type'),
    property_subtype: formData.get('property_subtype'),
    num_units: formData.get('num_units') || '1',
    purchase_price: nullifyEmpty(formData.get('purchase_price')),
    current_value: nullifyEmpty(formData.get('current_value')),
    mortgage_balance: nullifyEmpty(formData.get('mortgage_balance')),
    monthly_mortgage: nullifyEmpty(formData.get('monthly_mortgage')),
    condo_fee: nullifyEmpty(formData.get('condo_fee')),
    strata_fee: nullifyEmpty(formData.get('strata_fee')),
    status: formData.get('status') || 'active',
    notes: nullifyEmpty(formData.get('notes')),
  }

  const parsed = propertySchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { error } = await supabase.from('properties').insert({
    ...parsed.data,
    landlord_id: landlordId,
  })

  if (error) return { errors: { _form: [error.message] } }

  revalidatePath('/properties')
  revalidatePath('/overview')
  redirect('/properties')
}

export async function updateProperty(
  propertyId: string,
  _prevState: PropertyFormState,
  formData: FormData
): Promise<PropertyFormState> {
  let supabase: Awaited<ReturnType<typeof createClient>>
  let landlordId: string
  try {
    ;({ supabase, landlordId } = await getLandlordId())
  } catch (e) {
    return { errors: { _form: [(e as Error).message] } }
  }

  const raw = {
    name: formData.get('name'),
    address: formData.get('address'),
    city: formData.get('city'),
    province: formData.get('province'),
    postal_code: nullifyEmpty(formData.get('postal_code')),
    country: formData.get('country') || 'CA',
    type: formData.get('type'),
    property_subtype: formData.get('property_subtype'),
    num_units: formData.get('num_units') || '1',
    purchase_price: nullifyEmpty(formData.get('purchase_price')),
    current_value: nullifyEmpty(formData.get('current_value')),
    mortgage_balance: nullifyEmpty(formData.get('mortgage_balance')),
    monthly_mortgage: nullifyEmpty(formData.get('monthly_mortgage')),
    condo_fee: nullifyEmpty(formData.get('condo_fee')),
    strata_fee: nullifyEmpty(formData.get('strata_fee')),
    status: formData.get('status') || 'active',
    notes: nullifyEmpty(formData.get('notes')),
  }

  const parsed = propertySchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { error } = await supabase
    .from('properties')
    .update(parsed.data)
    .eq('id', propertyId)
    .eq('landlord_id', landlordId)

  if (error) return { errors: { _form: [error.message] } }

  revalidatePath('/properties')
  revalidatePath(`/properties/${propertyId}`)
  revalidatePath('/overview')
  redirect(`/properties/${propertyId}`)
}

export async function deleteProperty(propertyId: string): Promise<{ error?: string }> {
  let supabase: Awaited<ReturnType<typeof createClient>>
  let landlordId: string
  try {
    ;({ supabase, landlordId } = await getLandlordId())
  } catch (e) {
    return { error: (e as Error).message }
  }

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId)
    .eq('landlord_id', landlordId)

  if (error) return { error: error.message }

  revalidatePath('/properties')
  revalidatePath('/overview')
  redirect('/properties')
}
