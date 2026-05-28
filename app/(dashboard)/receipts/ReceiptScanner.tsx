'use client'

import { useState, useRef, useCallback, useTransition } from 'react'
import { Upload, ScanLine, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [extracted, setExtracted] = useState<ExtractedData | null>(null)
  const [receiptId, setReceiptId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Form state for confirmation
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

      setExtracted(json.data)
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
      setExtracted(null)
      setEditData(null)
      setReceiptId(null)
      router.refresh()
    })
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
      {/* Scanner panel — 3/5 */}
      <div className="lg:col-span-3 space-y-4">
        {/* Upload zone */}
        {(scanState === 'idle' || scanState === 'scanning') && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => scanState === 'idle' && fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all cursor-pointer h-52 ${
              isDragging
                ? 'border-dynasty-gold bg-dynasty-gold/5'
                : scanState === 'scanning'
                ? 'border-dynasty-gray-600 cursor-default'
                : 'border-dynasty-gray-600 hover:border-dynasty-gold/50 hover:bg-dynasty-gray-800/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
            {scanState === 'scanning' ? (
              <>
                <Loader2 className="h-10 w-10 text-dynasty-gold animate-spin mb-3" />
                <p className="text-sm font-medium text-dynasty-cream">Extracting data with Claude AI…</p>
                <p className="text-xs text-dynasty-gray-400 mt-1">Image is never stored</p>
              </>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dynasty-gold/20 bg-dynasty-gold/10 mb-3">
                  <Upload className="h-6 w-6 text-dynasty-gold" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium text-dynasty-cream">
                  Drop receipt here or click to upload
                </p>
                <p className="text-xs text-dynasty-gray-400 mt-1">
                  JPEG, PNG, WebP · Max 10MB
                </p>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Success state */}
        {scanState === 'success' && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-12">
            <CheckCircle className="h-12 w-12 text-emerald-400 mb-3" />
            <p className="font-serif text-lg font-semibold text-dynasty-cream">Receipt confirmed!</p>
            <p className="text-sm text-dynasty-gray-400 mt-1">Redirecting to transactions…</p>
          </div>
        )}

        {/* Confirmation form */}
        {scanState === 'confirm' && editData && (
          <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 overflow-hidden">
            <div className="border-b border-dynasty-gray-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-semibold text-dynasty-cream">
                  Extracted Data
                </h2>
                <p className="text-xs text-dynasty-gray-400 mt-0.5">
                  Review and edit before confirming
                </p>
              </div>
              {/* Confidence badge */}
              <div className="text-right">
                <p className="text-xs text-dynasty-gray-400">AI confidence</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 w-20 rounded-full bg-dynasty-gray-700 overflow-hidden">
                    <div
                      className="h-full bg-dynasty-gold rounded-full transition-all"
                      style={{ width: `${(editData.confidence ?? 0) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-dynasty-gold">
                    {Math.round((editData.confidence ?? 0) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    value={editData.vendor_name ?? ''}
                    onChange={(e) => setEditData({ ...editData, vendor_name: e.target.value || null })}
                    placeholder="Vendor name"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="amount">Amount (CAD) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editData.amount ?? ''}
                    onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) || null })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="receipt_date">Date *</Label>
                  <Input
                    id="receipt_date"
                    type="date"
                    value={editData.receipt_date ?? today}
                    onChange={(e) => setEditData({ ...editData, receipt_date: e.target.value || null })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
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

                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={editData.description ?? ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value || null })}
                    placeholder="Description"
                  />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="property">Associate with property</Label>
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

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex gap-3 pt-2">
                <Button onClick={handleConfirm} disabled={isPending} className="flex-1">
                  <CheckCircle className="h-4 w-4" />
                  {isPending ? 'Confirming…' : 'Confirm & create transaction'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={isPending}
                  className="text-red-400 border-red-500/30"
                >
                  <XCircle className="h-4 w-4" /> Discard
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent scans — 2/5 */}
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900">
          <div className="border-b border-dynasty-gray-700 px-6 py-4 flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-dynasty-gold" />
            <h2 className="font-serif text-lg font-semibold text-dynasty-cream">Recent Scans</h2>
          </div>
          <div className="divide-y divide-dynasty-gray-800">
            {recentReceipts.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-dynasty-gray-400">No receipts scanned yet</p>
              </div>
            ) : (
              recentReceipts.map((r) => (
                <div key={r.id} className="px-6 py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-dynasty-cream truncate">
                        {r.vendor_name ?? 'Unknown vendor'}
                      </p>
                      <p className="text-xs text-dynasty-gray-400">
                        {r.receipt_date ? formatDate(r.receipt_date) : '—'}
                        {r.category ? ` · ${r.category}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {r.amount && (
                        <p className="font-mono text-sm text-dynasty-gold">
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
                        className="text-xs mt-0.5"
                      >
                        {r.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
