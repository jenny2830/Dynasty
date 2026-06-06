'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
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

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "'Jost', sans-serif",
  fontSize: '9px',
  fontWeight: 400,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--text-muted-c)',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  whiteSpace: 'nowrap',
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

  const clearAll = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  const activeFilterCount = ['property_id', 'type', 'category', 'period'].filter(
    (k) => searchParams.has(k)
  ).length

  const groupBy = searchParams.get('group_by') ?? 'property'

  return (
    <div
      style={{
        background: 'var(--table-header-bg)',
        border: '1px solid var(--card-border-color)',
        borderRadius: '2px',
        padding: '14px 18px',
      }}
    >
      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {/* Label */}
        <span style={LABEL_STYLE}>
          <span style={{ fontSize: '6px', color: 'var(--accent-c)', opacity: 0.6 }}>◆</span>
          Filter
          {activeFilterCount > 0 && (
            <span style={{
              background: 'var(--accent-c)',
              color: 'var(--card-bg)',
              fontSize: '9px',
              fontWeight: 700,
              borderRadius: '1px',
              padding: '1px 5px',
              letterSpacing: '0',
            }}>
              {activeFilterCount}
            </span>
          )}
        </span>

        {/* Property filter */}
        <Select
          value={searchParams.get('property_id') ?? 'all'}
          onValueChange={(v) => setFilter('property_id', v)}
        >
          <SelectTrigger className="h-9 w-full sm:w-44">
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

        {/* Type filter */}
        <Select
          value={searchParams.get('type') ?? 'all'}
          onValueChange={(v) => setFilter('type', v)}
        >
          <SelectTrigger className="h-9 w-full sm:w-36">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        {/* Category filter */}
        <Select
          value={searchParams.get('category') ?? 'all'}
          onValueChange={(v) => setFilter('category', v)}
        >
          <SelectTrigger className="h-9 w-full sm:w-48">
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

        {/* Period filter */}
        <Select
          value={searchParams.get('period') ?? 'all'}
          onValueChange={(v) => setFilter('period', v)}
        >
          <SelectTrigger className="h-9 w-full sm:w-36">
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

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: 'var(--divider-c)', display: 'none' }} className="sm:block" />

        {/* Group by */}
        <span style={LABEL_STYLE}>
          <SlidersHorizontal size={10} strokeWidth={1.5} style={{ color: 'var(--accent-c)', opacity: 0.7 }} />
          Group
        </span>
        <Select
          value={groupBy}
          onValueChange={(v) => setFilter('group_by', v)}
        >
          <SelectTrigger className="h-9 w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="property">By property</SelectItem>
            <SelectItem value="category">By category</SelectItem>
            <SelectItem value="none">By date</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear all */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontFamily: "'Jost', sans-serif",
              fontSize: '10px',
              fontWeight: 400,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-muted-c)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 2px',
              borderRadius: '1px',
              transition: 'color 0.15s',
            }}
          >
            <X size={11} strokeWidth={1.5} />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
