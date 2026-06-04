'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAppTheme } from '@/lib/theme-context'
import { useThemeStyles } from '@/lib/useThemeStyles'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Building2, MapPin, RefreshCw } from 'lucide-react'

export default function PropertiesPage() {
  const { theme } = useAppTheme()
  const styles = useThemeStyles()
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Ensure session is valid
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError || !refreshData.session) {
          router.push('/login')
          return
        }
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Retry landlord lookup up to 3 times (guards against transient DB hiccups)
      let landlord: { id: string } | null = null
      for (let i = 0; i < 3; i++) {
        const { data, error: lErr } = await supabase
          .from('landlords')
          .select('id')
          .eq('auth_user_id', user.id)
          .maybeSingle()
        if (data) { landlord = data; break }
        if (lErr) console.error(`[Properties] landlord fetch attempt ${i + 1}:`, lErr)
        if (i < 2) await new Promise(r => setTimeout(r, 500))
      }

      if (!landlord) {
        setError('failed_to_load')
        setLoading(false)
        return
      }

      const { data: props, error: propsError } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', landlord.id)
        .order('created_at', { ascending: false })

      if (propsError) {
        console.error('[Properties] properties fetch error:', propsError)
        setError('failed_to_load')
        setLoading(false)
        return
      }

      setProperties(props || [])
    } catch (err) {
      console.error('[Properties] unexpected error:', err)
      setError('failed_to_load')
    } finally {
      setLoading(false)
    }
  }, [retryCount, router])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <div style={{
          width: '28px', height: '28px',
          border: `2px solid ${theme.accent}30`,
          borderTopColor: theme.accent,
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }} />
        <p style={styles.mutedText}>Loading your properties...</p>
      </div>
    )
  }

  if (error === 'failed_to_load') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
        <p style={{ ...styles.bodyText, color: theme.valueNegative }}>
          Failed to load your account. Please try again.
        </p>
        <button
          onClick={() => setRetryCount(c => c + 1)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: theme.accentGradient,
            color: theme.textOnAccent,
            ...styles.buttonText,
            padding: '10px 24px',
            borderRadius: '1px', border: 'none', cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} strokeWidth={1.5} />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', flexWrap: 'wrap',
        gap: '16px', marginBottom: '32px',
      }}>
        <div>
          <h1 style={styles.pageTitle}>
            <span style={{ color: theme.accent, fontSize: '8px', marginRight: '8px' }}>◆</span>
            Properties
          </h1>
          <p style={{ ...styles.mutedText, marginTop: '6px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {properties.length} {properties.length === 1 ? 'Estate' : 'Estates'} in Portfolio
          </p>
          <div style={{ width: '32px', height: '1px', background: theme.accent, opacity: 0.5, marginTop: '12px' }} />
        </div>
        <button
          onClick={() => router.push('/properties/new')}
          style={{
            background: theme.accentGradient,
            color: theme.textOnAccent,
            ...styles.buttonText,
            padding: '12px 28px',
            borderRadius: '1px', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          + ADD PROPERTY
        </button>
      </div>

      {/* Empty state */}
      {properties.length === 0 ? (
        <div style={{
          background: theme.cardBg,
          border: theme.cardBorder,
          borderRadius: '2px',
          padding: '64px',
          textAlign: 'center',
        }}>
          <Building2 size={36} strokeWidth={1} style={{ color: `${theme.accent}30`, margin: '0 auto 16px', display: 'block' }} />
          <p style={{ ...styles.cardTitle, marginBottom: '8px' }}>No properties yet</p>
          <p style={{ ...styles.mutedText, marginBottom: '24px' }}>
            Add your first property to start tracking income, expenses, and ROI.
          </p>
          <button
            onClick={() => router.push('/properties/new')}
            style={{
              background: 'transparent',
              border: `1px solid ${theme.accent}50`,
              color: theme.accent,
              ...styles.buttonText,
              padding: '10px 24px',
              borderRadius: '1px',
              cursor: 'pointer',
            }}
          >
            + ADD YOUR FIRST PROPERTY
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {properties.map(property => (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                background: theme.cardBg,
                border: theme.cardBorder,
                borderRadius: '2px',
                boxShadow: theme.cardShadow,
                padding: '24px',
                cursor: 'pointer',
                transition: 'border-color 0.3s',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Art deco corners */}
                <div style={{ position: 'absolute', top: '6px', left: '6px', width: '14px', height: '14px', borderTop: `1px solid ${theme.cornerMark}`, borderLeft: `1px solid ${theme.cornerMark}`, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '14px', height: '14px', borderBottom: `1px solid ${theme.cornerMark}`, borderRight: `1px solid ${theme.cornerMark}`, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: theme.topLine }} />

                {/* Type + status badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ ...styles.badge, background: `${theme.accent}12`, color: theme.accent, border: `1px solid ${theme.accent}30` }}>
                    {property.type}
                  </span>
                  <span style={{
                    ...styles.badge,
                    background: property.status === 'active' ? `${theme.accent}12` : `${theme.valueNegative}12`,
                    color: property.status === 'active' ? theme.accent : theme.valueNegative,
                    border: `1px solid ${property.status === 'active' ? theme.accent : theme.valueNegative}30`,
                  }}>
                    {property.status}
                  </span>
                </div>

                {/* Name */}
                <h3 style={{ ...styles.cardTitle, fontSize: '20px', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {property.name}
                </h3>

                {/* Address */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                  <MapPin size={13} strokeWidth={1.2} style={{ color: theme.textMuted, flexShrink: 0 }} />
                  <p style={{ ...styles.mutedText, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {[property.address, property.city, property.province].filter(Boolean).join(', ')}
                  </p>
                </div>

                {/* Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '16px', borderTop: `1px solid ${theme.dividerColor}` }}>
                  <div>
                    <p style={{ ...styles.cardLabel, fontSize: '9px', marginBottom: '4px' }}>Current Value</p>
                    <p style={{ ...styles.financial, color: theme.accent, fontSize: '15px' }}>
                      {property.current_value ? formatCurrency(property.current_value) : '—'}
                    </p>
                  </div>
                  <div>
                    <p style={{ ...styles.cardLabel, fontSize: '9px', marginBottom: '4px' }}>Purchase Price</p>
                    <p style={{ ...styles.financial, color: theme.textPrimary, fontSize: '15px' }}>
                      {property.purchase_price ? formatCurrency(property.purchase_price) : '—'}
                    </p>
                  </div>
                  {property.monthly_mortgage > 0 && (
                    <div>
                      <p style={{ ...styles.cardLabel, fontSize: '9px', marginBottom: '4px' }}>Mortgage/mo</p>
                      <p style={{ ...styles.financial, color: theme.valueNegative, fontSize: '15px' }}>
                        {formatCurrency(property.monthly_mortgage)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p style={{ ...styles.cardLabel, fontSize: '9px', marginBottom: '4px' }}>Units</p>
                    <p style={{ ...styles.financial, color: theme.textPrimary, fontSize: '15px' }}>
                      {property.num_units || 1}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
