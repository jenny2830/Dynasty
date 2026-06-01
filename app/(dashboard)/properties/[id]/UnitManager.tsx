'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppTheme } from '@/lib/theme-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { NumberInput } from '@/components/ui/NumberInput'

interface Unit {
  id: string
  property_id: string
  unit_number: string
  bedrooms: number | null
  bathrooms: number | null
  sqft: number | null
  rent_amount: number | null
  status: string
}

interface UnitFormData {
  unit_number: string
  bedrooms: number | null
  bathrooms: number | null
  sqft: number | null
  rent_amount: number | null
  status: string
}

const EMPTY_FORM: UnitFormData = {
  unit_number: '',
  bedrooms: null,
  bathrooms: null,
  sqft: null,
  rent_amount: null,
  status: 'vacant',
}

function unitToForm(u: Unit): UnitFormData {
  return {
    unit_number: u.unit_number,
    bedrooms: u.bedrooms,
    bathrooms: u.bathrooms,
    sqft: u.sqft,
    rent_amount: u.rent_amount,
    status: u.status,
  }
}

interface UnitFormProps {
  form: UnitFormData
  setForm: (f: UnitFormData) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  error: string | null
  title: string
}

function UnitForm({ form, setForm, onSave, onCancel, saving, error, title }: UnitFormProps) {
  const set = (key: 'unit_number' | 'status') => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value })

  return (
    <div style={{
      background: 'rgba(201,168,76,0.03)',
      border: '1px solid rgba(201,168,76,0.18)',
      borderRadius: '2px',
      padding: '20px',
      marginTop: '12px',
    }}>
      <p style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: '10px',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: '#C9A84C',
        margin: '0 0 16px 0',
      }}>
        {title}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <Label htmlFor="unit_number">Unit Number *</Label>
          <Input
            id="unit_number"
            value={form.unit_number}
            onChange={set('unit_number')}
            placeholder="e.g. 1A, 202, B"
            style={{ marginTop: '6px' }}
          />
        </div>

        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <NumberInput
            id="bedrooms"
            value={form.bedrooms}
            onChange={(v) => setForm({ ...form, bedrooms: v })}
            decimals={0}
            placeholder="2"
            style={{ marginTop: '6px' }}
          />
        </div>

        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <NumberInput
            id="bathrooms"
            value={form.bathrooms}
            onChange={(v) => setForm({ ...form, bathrooms: v })}
            decimals={1}
            placeholder="1.5"
            style={{ marginTop: '6px' }}
          />
        </div>

        <div>
          <Label htmlFor="sqft">Sq Ft</Label>
          <NumberInput
            id="sqft"
            value={form.sqft}
            onChange={(v) => setForm({ ...form, sqft: v })}
            decimals={0}
            placeholder="850"
            style={{ marginTop: '6px' }}
          />
        </div>

        <div>
          <Label htmlFor="rent_amount">Monthly Rent (CAD)</Label>
          <NumberInput
            id="rent_amount"
            value={form.rent_amount}
            onChange={(v) => setForm({ ...form, rent_amount: v })}
            prefix="$"
            decimals={2}
            placeholder="1,800.00"
            style={{ marginTop: '6px' }}
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <Label htmlFor="unit_status">Status</Label>
          <div style={{ marginTop: '6px' }}>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger id="unit_status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="vacant">Vacant</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {error && (
        <p style={{ color: '#D4959E', fontFamily: "'Jost', sans-serif", fontSize: '12px', marginTop: '10px' }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <Button onClick={onSave} disabled={saving} size="sm">
          <Check />
          {saving ? 'Saving…' : 'Save Unit'}
        </Button>
        <Button variant="outline" size="sm" onClick={onCancel} disabled={saving}>
          <X /> Cancel
        </Button>
      </div>
    </div>
  )
}

interface UnitManagerProps {
  propertyId: string
  initialUnits: Unit[]
}

export function UnitManager({ propertyId, initialUnits }: UnitManagerProps) {
  const { theme } = useAppTheme()
  const router = useRouter()
  const [units, setUnits] = useState<Unit[]>(initialUnits)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addForm, setAddForm] = useState<UnitFormData>(EMPTY_FORM)
  const [editForm, setEditForm] = useState<UnitFormData>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const supabase = createClient()

  function parseForm(f: UnitFormData) {
    return {
      unit_number: f.unit_number.trim(),
      bedrooms: f.bedrooms != null ? Math.round(f.bedrooms) : null,
      bathrooms: f.bathrooms,
      sqft: f.sqft != null ? Math.round(f.sqft) : null,
      rent_amount: f.rent_amount,
      status: f.status as 'occupied' | 'vacant' | 'maintenance',
    }
  }

  function handleAddUnit() {
    if (!addForm.unit_number.trim()) { setError('Unit number is required'); return }
    setError(null)
    startTransition(async () => {
      const { data, error: err } = await supabase
        .from('units')
        .insert({ property_id: propertyId, ...parseForm(addForm) })
        .select()
        .single()

      if (err) { setError(err.message); return }
      setUnits((prev) => [...prev, data as Unit])
      setAddForm(EMPTY_FORM)
      setShowAdd(false)
      router.refresh()
    })
  }

  function startEdit(unit: Unit) {
    setEditingId(unit.id)
    setEditForm(unitToForm(unit))
    setError(null)
    setShowAdd(false)
  }

  function handleEditUnit() {
    if (!editForm.unit_number.trim()) { setError('Unit number is required'); return }
    setError(null)
    startTransition(async () => {
      const { data, error: err } = await supabase
        .from('units')
        .update(parseForm(editForm))
        .eq('id', editingId!)
        .select()
        .single()

      if (err) { setError(err.message); return }
      setUnits((prev) => prev.map((u) => (u.id === editingId ? (data as Unit) : u)))
      setEditingId(null)
      router.refresh()
    })
  }

  function handleDelete(unitId: string) {
    startTransition(async () => {
      const { error: err } = await supabase.from('units').delete().eq('id', unitId)
      if (err) { setError(err.message); return }
      setUnits((prev) => prev.filter((u) => u.id !== unitId))
      setDeleteId(null)
      router.refresh()
    })
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '18px',
          fontWeight: 500,
          color: 'var(--text-primary, #FAF7F2)',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '8px', color: '#C9A84C' }}>◆</span>
          Units
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '11px', color: '#8A8A82', fontWeight: 400 }}>
            ({units.length} added)
          </span>
        </h2>
        {!showAdd && (
          <button
            onClick={() => { setShowAdd(true); setEditingId(null); setError(null) }}
            style={{
              background: theme.accentGradient,
              color: theme.textOnAccent,
              fontFamily: "'Jost', sans-serif",
              fontWeight: 600,
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '8px 18px',
              borderRadius: '1px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={13} strokeWidth={2} /> Add Unit
          </button>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <UnitForm
          form={addForm}
          setForm={setAddForm}
          onSave={handleAddUnit}
          onCancel={() => { setShowAdd(false); setError(null) }}
          saving={isPending}
          error={error}
          title="New Unit"
        />
      )}

      {/* Units list */}
      {units.length === 0 && !showAdd ? (
        <p style={{ color: '#6B6B65', fontFamily: "'Jost', sans-serif", fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
          No units added yet. Click &ldquo;Add Unit&rdquo; to start.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: units.length > 0 ? '8px' : '0' }}>
          {units.map((unit) => (
            <div key={unit.id}>
              {editingId === unit.id ? (
                <UnitForm
                  form={editForm}
                  setForm={setEditForm}
                  onSave={handleEditUnit}
                  onCancel={() => { setEditingId(null); setError(null) }}
                  saving={isPending}
                  error={error}
                  title={`Edit Unit ${unit.unit_number}`}
                />
              ) : (
                <div style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(201,168,76,0.08)',
                  borderRadius: '2px',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '13px', color: 'var(--text-primary, #FAF7F2)', fontWeight: 500 }}>
                      Unit {unit.unit_number}
                    </span>
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '11px', color: '#8A8A82', marginLeft: '12px' }}>
                      {[
                        unit.bedrooms != null && `${unit.bedrooms}BR`,
                        unit.bathrooms != null && `${unit.bathrooms}BA`,
                        unit.sqft != null && `${unit.sqft} sqft`,
                      ].filter(Boolean).join(' · ')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                    {unit.rent_amount != null && (
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '13px',
                        color: unit.status === 'occupied' ? '#C9A84C' : '#B76E79',
                      }}>
                        {formatCurrency(unit.rent_amount)}/mo
                      </span>
                    )}
                    <Badge
                      variant={
                        unit.status === 'occupied' ? 'success'
                        : unit.status === 'maintenance' ? 'warning'
                        : 'secondary'
                      }
                    >
                      {unit.status}
                    </Badge>

                    {/* Edit / Delete */}
                    {deleteId === unit.id ? (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#D4959E', fontFamily: "'Jost', sans-serif" }}>Delete?</span>
                        <button
                          onClick={() => handleDelete(unit.id)}
                          disabled={isPending}
                          style={{ color: '#D4959E', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                        >
                          <Check size={14} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          style={{ color: '#8A8A82', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                        >
                          <X size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => startEdit(unit)}
                          style={{ color: '#8A8A82', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                          title="Edit unit"
                        >
                          <Pencil size={13} strokeWidth={1.4} />
                        </button>
                        <button
                          onClick={() => setDeleteId(unit.id)}
                          style={{ color: '#8A8A82', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                          title="Delete unit"
                        >
                          <Trash2 size={13} strokeWidth={1.4} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
