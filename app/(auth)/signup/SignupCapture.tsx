'use client'

import { useEffect } from 'react'
import { generateFingerprint } from '@/lib/fingerprint'

interface SignupCaptureProps {
  email: string
}

/**
 * Fires once after a successful signup to log the device fingerprint and
 * IP address (resolved server-side) for anti-abuse tracking.
 * Runs silently — user never sees any indication.
 */
export function SignupCapture({ email }: SignupCaptureProps) {
  useEffect(() => {
    const fingerprint = generateFingerprint()
    fetch('/api/auth/capture-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fingerprint }),
    }).catch(() => {
      // Best-effort — never surface errors to the user
    })
  }, [email])

  return null
}
