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
import { useLocale } from '@/lib/locale-context'
import { translateKnownError } from '@/lib/i18n/translate'

export function DeleteTransactionButton({ txId }: { txId: string }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { t } = useLocale()

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
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash2 /> {t('common.delete')}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('tx.deleteTitle')}</DialogTitle>
            <DialogDescription>{t('tx.deleteBody')}</DialogDescription>
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
              {isPending ? t('common.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
