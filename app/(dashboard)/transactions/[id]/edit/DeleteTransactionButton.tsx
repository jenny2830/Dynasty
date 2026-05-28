'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { deleteTransaction } from '@/app/actions/transactions'

export function DeleteTransactionButton({ txId }: { txId: string }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTransaction(txId)
      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/transactions')
        router.refresh()
      }
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-red-400 border-red-500/30 hover:bg-red-500/10"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" /> Delete
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete transaction?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
