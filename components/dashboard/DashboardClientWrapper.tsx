'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TrialBanner } from '@/components/TrialBanner'
import { FREE_TRIAL_MAX_SESSIONS } from '@/lib/plans'

interface DashboardClientWrapperProps {
  landlordId: string
  isMember: boolean
  sessionsUsed: number
  trialExpired: boolean
  children: React.ReactNode
}

export function DashboardClientWrapper({
  landlordId,
  isMember,
  sessionsUsed,
  trialExpired,
  children,
}: DashboardClientWrapperProps) {
  const router = useRouter()
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    // Members and users whose trial has already expired don't consume trial sessions
    if (isMember || trialExpired) return

    const today = new Date().toISOString().split('T')[0]
    const sessionKey = `dynasty_session_${today}`

    if (sessionStorage.getItem(sessionKey)) return
    sessionStorage.setItem(sessionKey, 'counted')
    tracked.current = true

    const newCount = sessionsUsed + 1
    const isExpired = newCount >= FREE_TRIAL_MAX_SESSIONS

    const supabase = createClient()
    supabase
      .from('landlords')
      .update({ sessions_used: newCount, free_trial_expired: isExpired })
      .eq('id', landlordId)
      .then(() => {
        if (isExpired) router.refresh()
      })
  }, [landlordId, isMember, sessionsUsed, trialExpired, router])

  return (
    <>
      <TrialBanner isMember={isMember} sessionsUsed={sessionsUsed} trialExpired={trialExpired} />
      {children}
    </>
  )
}
