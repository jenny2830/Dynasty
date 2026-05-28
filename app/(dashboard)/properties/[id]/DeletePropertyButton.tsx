'use client'

import { useState, useTransition } from 'react'
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
import { deleteProperty } from '@/app/actions/properties'

export function DeletePropertyButton({ propertyId }: { propertyId: string }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProperty(propertyId)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete property?</DialogTitle>
            <DialogDescription>
              This will permanently delete the property and all associated transactions,
              units, and recurring payments. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? 'Deleting…' : 'Delete permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
