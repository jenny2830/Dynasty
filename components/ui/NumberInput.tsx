'use client'
import { useState, useEffect, useRef } from 'react'

interface NumberInputProps {
  /** Controlled mode: current numeric value */
  value?: number | null
  /** Controlled mode: callback with parsed numeric value */
  onChange?: (value: number | null) => void

  /** Form mode: HTML name for FormData submission (creates a hidden input) */
  name?: string
  /** Form mode: initial numeric value for the hidden input */
  defaultValue?: number | null | string

  prefix?: string    // "$" for currency, empty for integers
  decimals?: number  // 2 for currency, 0 for integers, 1 for percent
  placeholder?: string
  style?: React.CSSProperties
  className?: string
  id?: string
  required?: boolean
}

export function NumberInput({
  value,
  onChange,
  name,
  defaultValue,
  prefix = '',
  decimals = 2,
  placeholder = '0',
  style,
  className,
  id,
  required,
}: NumberInputProps) {
  const isControlled = value !== undefined || onChange !== undefined
  const inputRef = useRef<HTMLInputElement>(null)

  // Raw numeric value tracked for the hidden form input
  const [rawValue, setRawValue] = useState<number | null>(() => {
    if (isControlled) return value ?? null
    if (defaultValue == null || defaultValue === '') return null
    const n = typeof defaultValue === 'string' ? parseFloat(defaultValue) : defaultValue
    return isNaN(n) ? null : n
  })

  // Formatted display string shown in the visible input
  const [display, setDisplay] = useState<string>(() => {
    const n = isControlled ? (value ?? null) : rawValue
    if (n == null) return ''
    return formatWithCommas(n, decimals)
  })

  function formatWithCommas(num: number, dec: number): string {
    return num.toLocaleString('en-CA', {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    })
  }

  // Sync controlled value → display (only when not focused)
  useEffect(() => {
    if (!isControlled) return
    if (document.activeElement === inputRef.current) return
    const n = value ?? null
    setRawValue(n)
    setDisplay(n == null ? '' : formatWithCommas(n, decimals))
  }, [value, decimals, isControlled])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value

    // Strip everything except digits, dot, minus
    raw = raw.replace(/[^0-9.\-]/g, '')

    // Prevent multiple decimal points
    const dotIdx = raw.indexOf('.')
    if (dotIdx !== -1) {
      raw = raw.slice(0, dotIdx + 1) + raw.slice(dotIdx + 1).replace(/\./g, '')
    }

    // Build formatted display (commas in integer part)
    const isNeg = raw.startsWith('-')
    const absRaw = isNeg ? raw.slice(1) : raw
    const dotI = absRaw.indexOf('.')
    const intPart = dotI >= 0 ? absRaw.slice(0, dotI) : absRaw
    const decPart = dotI >= 0 ? absRaw.slice(dotI) : ''
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    setDisplay((isNeg ? '-' : '') + formattedInt + decPart)

    const num = parseFloat(raw)
    const parsed = raw === '' || raw === '-' || raw === '.' ? null : isNaN(num) ? null : num
    setRawValue(parsed)
    onChange?.(parsed)
  }

  function handleBlur() {
    const n = isControlled ? (value ?? null) : rawValue
    if (n != null) {
      setDisplay(formatWithCommas(n, decimals))
    } else {
      setDisplay('')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#111111',
    border: '1px solid rgba(201,168,76,0.12)',
    borderRadius: '1px',
    color: '#FAF7F2',
    padding: prefix ? '11px 15px 11px 28px' : '11px 15px',
    fontSize: '13px',
    fontFamily: "'JetBrains Mono', monospace",
    outline: 'none',
    boxSizing: 'border-box' as const,
    ...style,
  }

  return (
    <div style={{ position: 'relative' }}>
      {prefix && (
        <span style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#C9A84C',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '13px',
          pointerEvents: 'none',
          zIndex: 1,
        }}>
          {prefix}
        </span>
      )}
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        style={inputStyle}
        required={required}
        autoComplete="off"
      />
      {/* Hidden input for server-action FormData submission */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={rawValue ?? ''}
          required={required}
        />
      )}
    </div>
  )
}
