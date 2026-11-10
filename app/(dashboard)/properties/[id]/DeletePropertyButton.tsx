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
import { useLocale } from '@/lib/locale-context'
import { translateKnownError } from '@/lib/i18n/translate'

export function DeletePropertyButton({ propertyId }: { propertyId: string }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const { t } = useLocale()

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
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash2 />
        {t('common.delete')}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('properties.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('properties.deleteBody')}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p className="font-sans text-[12px] font-light text-dynasty-rose-light">
              {translateKnownError(error, t)}
            </p>
          )}
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? t('common.deleting') : t('properties.deleteForever')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
