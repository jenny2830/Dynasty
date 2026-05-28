'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EXPENSE_CATEGORIES } from '@/lib/constants'

interface Property {
  id: string
  name: string
}

interface TransactionFiltersProps {
  properties: Property[]
}

export function TransactionFilters({ properties }: TransactionFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === 'all' || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="mr-1 font-sans text-[9px] font-light uppercase tracking-[0.22em] text-dynasty-gray-500">
        <span className="mr-2 text-[6px] text-[rgba(201,168,76,0.5)] leading-none">◆</span>
        Filter
      </p>

      <Select
        value={searchParams.get('property_id') ?? 'all'}
        onValueChange={(v) => setFilter('property_id', v)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All properties" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All properties</SelectItem>
          {properties.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('type') ?? 'all'}
        onValueChange={(v) => setFilter('type', v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('category') ?? 'all'}
        onValueChange={(v) => setFilter('category', v)}
      >
        <SelectTrigger className="w-52">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {EXPENSE_CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('period') ?? 'all'}
        onValueChange={(v) => setFilter('period', v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All time" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All time</SelectItem>
          <SelectItem value="this_month">This month</SelectItem>
          <SelectItem value="last_month">Last month</SelectItem>
          <SelectItem value="this_quarter">This quarter</SelectItem>
          <SelectItem value="this_year">This year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
