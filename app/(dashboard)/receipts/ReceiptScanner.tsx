'use client'

import { useState, useRef, useCallback, useTransition } from 'react'
import { ScanLine, CheckCircle2, XCircle, Loader2, Camera, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/NumberInput'
import { Badge } from '@/components/ui/badge'
import { Section, SectionHeader } from '@/components/ui/section'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EXPENSE_ONLY_CATEGORIES } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import { confirmReceipt, rejectReceipt } from '@/app/actions/receipts'
import { useRouter } from 'next/navigation'
import { useAppTheme } from '@/lib/theme-context'

interface Property {
  id: string
  name: string
}

interface RecentReceipt {
  id: string
  vendor_name: string | null
  amount: number | null
  receipt_date: string | null
  category: string | null
  status: string
  ai_confidence: number | null
}

interface ExtractedData {
  vendor_name: string | null
  amount: number | null
  receipt_date: string | null
  category: string | null
  description: string | null
  confidence: number
}

type ScanState = 'idle' | 'uploading' | 'scanning' | 'confirm' | 'success'

interface ReceiptScannerProps {
  properties: Property[]
  recentReceipts: RecentReceipt[]
}

export function ReceiptScanner({ properties, recentReceipts }: ReceiptScannerProps) {
  const { theme } = useAppTheme()
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [receiptId, setReceiptId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const [editData, setEditData] = useState<ExtractedData | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<string>('none')

  const processFile = useCallback(async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/)) {
      setError('Please upload a JPEG, PNG, WebP, or GIF image.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.')
      return
    }

    setScanState('scanning')
    setError(null)

    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const res = await fetch('/api/receipts/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mediaType: file.type,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Scan failed')
      }

      setEditData(json.data)
      setReceiptId(json.receiptId)
      setScanState('confirm')
    } catch (e) {
      setError((e as Error).message)
      setScanState('idle')
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleConfirm = () => {
    if (!editData || !receiptId) return
    if (!editData.amount || !editData.receipt_date || !editData.category) {
      setError('Amount, date, and category are required')
      return
    }

    startTransition(async () => {
      const result = await confirmReceipt({
        receiptId,
        vendorName: editData.vendor_name,
        amount: editData.amount!,
        receiptDate: editData.receipt_date!,
        category: editData.category!,
        description: editData.description,
        propertyId: selectedProperty === 'none' || !selectedProperty ? null : selectedProperty,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setScanState('success')
        setTimeout(() => {
          router.push('/transactions')
          router.refresh()
        }, 1800)
      }
    })
  }

  const handleReject = () => {
    if (!receiptId) return
    startTransition(async () => {
      await rejectReceipt(receiptId)
      setScanState('idle')
      setEditData(null)
      setReceiptId(null)
      router.refresh()
    })
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
      {/* Scanner panel — 3/5 */}
      <div className="lg:col-span-3 space-y-5">
        {/* Upload zone */}
        {(scanState === 'idle' || scanState === 'scanning') && (
          <div>
            {/* Drag-and-drop zone (no click handler — use buttons below instead) */}
            <div
              onDragOver={(e) => { e.preventDefault(); if (scanState === 'idle') setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className="relative flex h-48 flex-col items-center justify-center rounded-[2px] border border-dashed px-6 transition-all duration-300"
              style={{
                background: isDragging ? `${theme.accent}05` : theme.tableBg,
                borderColor: isDragging ? theme.accent : theme.cornerMark,
              }}
            >
              {scanState === 'scanning' ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin" strokeWidth={1.2} style={{ color: `${theme.accent}99` }} />
                  <p className="mt-4 font-serif text-[18px] font-medium tracking-[0.02em]" style={{ color: theme.textPrimary }}>
                    Extracting Receipt Data
                  </p>
                  <p className="mt-2 font-sans text-[11px] font-light uppercase tracking-[0.18em]" style={{ color: theme.textMuted }}>
                    Claude Vision · Image never stored
                  </p>
                </>
              ) : (
                <>
                  <ScanLine className="h-8 w-8" strokeWidth={1} style={{ color: `${theme.accent}4D` }} />
                  <p className="mt-4 font-serif text-[18px] font-medium tracking-[0.02em]" style={{ color: theme.textPrimary }}>
                    Drop Receipt Here
                  </p>
                  <p className="mt-2 font-sans text-[11px] font-light uppercase tracking-[0.18em]" style={{ color: theme.textMuted }}>
                    JPEG · PNG · WebP · Max 10MB
                  </p>
                </>
              )}
            </div>

            {/* Two action buttons — gallery pick + camera capture */}
            {scanState === 'idle' && (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                {/* Upload from gallery / file picker */}
                <button
                  type="button"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/jpeg,image/png,image/webp,image/heic'
                    input.onchange = (e) => handleFileChange(e as unknown as React.ChangeEvent<HTMLInputElement>)
                    input.click()
                  }}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${theme.accent}4D`,
                    color: theme.accent,
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    padding: '10px 20px',
                    borderRadius: '1px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Upload size={14} strokeWidth={1.2} />
                  Upload Image
                </button>

                {/* Camera capture — triggers rear camera on mobile */}
                <button
                  type="button"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/jpeg,image/png,image/webp'
                    ;(input as HTMLInputElement & { capture: string }).capture = 'environment'
                    input.onchange = (e) => handleFileChange(e as unknown as React.ChangeEvent<HTMLInputElement>)
                    input.click()
                  }}
                  style={{
                    background: theme.accentGradient,
                    color: theme.textOnAccent,
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    padding: '10px 20px',
                    borderRadius: '1px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 600,
                  }}
                >
                  <Camera size={14} strokeWidth={1.2} />
                  Scan Receipt
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-[1px] border border-[rgba(183,110,121,0.3)] bg-[rgba(183,110,121,0.08)] px-4 py-3">
            <p className="font-sans text-[12px] font-light text-dynasty-rose-light">
              {error}
            </p>
          </div>
        )}

        {scanState === 'success' && (
          <div className="flex flex-col items-center justify-center rounded-[2px] border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.04)] py-12">
            <CheckCircle2 className="h-10 w-10 text-dynasty-gold" strokeWidth={1.2} />
            <p className="mt-4 font-serif text-[20px] font-medium tracking-[0.02em] text-dynasty-warm-white">
              Receipt Confirmed
            </p>
            <p className="mt-1.5 font-sans text-[11px] font-light uppercase tracking-[0.18em] text-dynasty-gray-500">
              Redirecting to transactions
            </p>
          </div>
        )}

        {/* Confirmation form */}
        {scanState === 'confirm' && editData && (
          <Section variant="warm" className="overflow-hidden">
            <div className="flex items-center justify-between px-7 py-5 border-b border-[rgba(201,168,76,0.08)]">
              <div>
                <h2 className="font-serif text-[18px] font-medium tracking-[0.02em] text-dynasty-warm-white">
                  Extracted Data
                </h2>
                <p className="mt-0.5 font-sans text-[11px] font-light uppercase tracking-[0.12em] text-dynasty-gray-500">
                  Review and edit before confirming
                </p>
              </div>
              <div className="text-right">
                <p className="font-sans text-[9px] font-light uppercase tracking-[0.22em] text-dynasty-gray-500">
                  AI Confidence
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-[2px] w-24 bg-dynasty-gray-700 overflow-hidden">
                    <div
                      className="h-full bg-dynasty-gold transition-all"
                      style={{ width: `${(editData.confidence ?? 0) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-[12px] font-medium text-dynasty-gold">
                    {Math.round((editData.confidence ?? 0) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="px-7 py-6 space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    value={editData.vendor_name ?? ''}
                    onChange={(e) => setEditData({ ...editData, vendor_name: e.target.value || null })}
                    placeholder="Vendor name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (CAD) *</Label>
                  <NumberInput
                    id="amount"
                    value={editData.amount}
                    onChange={(v) => setEditData({ ...editData, amount: v })}
                    prefix="$"
                    decimals={2}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receipt_date">Date *</Label>
                  <Input
                    id="receipt_date"
                    type="date"
                    value={editData.receipt_date ?? today}
                    onChange={(e) => setEditData({ ...editData, receipt_date: e.target.value || null })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={editData.category ?? ''}
                    onValueChange={(v) => setEditData({ ...editData, category: v })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_ONLY_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={editData.description ?? ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value || null })}
                    placeholder="Description"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-2">
                  <Label htmlFor="property">Associate with Property</Label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger id="property">
                      <SelectValue placeholder="Select property (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No property</SelectItem>
                      {properties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <p className="font-sans text-[12px] font-light text-dynasty-rose-light">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button onClick={handleConfirm} disabled={isPending} className="flex-1">
                  <CheckCircle2 />
                  {isPending ? 'Confirming…' : 'Confirm & Create'}
                </Button>
                <Button variant="destructive" onClick={handleReject} disabled={isPending}>
                  <XCircle /> Discard
                </Button>
              </div>
            </div>
          </Section>
        )}
      </div>

      {/* Recent scans — 2/5 */}
      <div className="lg:col-span-2">
        <Section>
          <SectionHeader title="Recent Scans" />
          <div className="divide-y divide-[rgba(255,255,255,0.025)]">
            {recentReceipts.length === 0 ? (
              <div className="flex items-center justify-center px-6 py-10">
                <p className="font-sans text-[12px] font-light text-dynasty-gray-500">
                  No receipts scanned yet
                </p>
              </div>
            ) : (
              recentReceipts.map((r) => (
                <div key={r.id} className="px-7 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-sans text-[13px] text-dynasty-warm-white">
                        {r.vendor_name ?? 'Unknown vendor'}
                      </p>
                      <p className="mt-0.5 font-sans text-[11px] font-light text-dynasty-gray-500">
                        {r.receipt_date ? formatDate(r.receipt_date) : '—'}
                        {r.category ? ` · ${r.category}` : ''}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {r.amount && (
                        <p className="font-mono text-[13px] font-medium text-dynasty-gold">
                          {formatCurrency(r.amount)}
                        </p>
                      )}
                      <Badge
                        variant={
                          r.status === 'confirmed'
                            ? 'success'
                            : r.status === 'rejected'
                            ? 'destructive'
                            : 'warning'
                        }
                        className="mt-1.5"
                      >
                        {r.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Section>
      </div>
    </div>
  )
}
