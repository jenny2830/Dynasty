import { ConfirmForm } from './ConfirmForm'
import { defaultNextFor, isConfirmType, safeNextPath } from './shared'

export const metadata = { title: 'Confirm' }

// Email security scanners prefetch links, so this page must never verify the
// token on GET — verification only happens when the user submits the form.
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; next?: string }>
}) {
  const { token_hash: tokenHash, type, next } = await searchParams

  const validType = isConfirmType(type) ? type : null
  const isRecovery = validType === 'recovery'
  const initialError = tokenHash && validType ? null : 'This link is invalid or incomplete.'
  const safeNext = safeNextPath(next, defaultNextFor(validType ?? 'email'))

  return (
    <div className="auth-gate" style={{
      minHeight: '100vh',
      backgroundColor: '#080808',
      backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, #1C1A17 0%, #080808 70%), linear-gradient(135deg, rgba(201,168,76,0.06) 0%, transparent 40%), linear-gradient(225deg, rgba(201,168,76,0.04) 0%, transparent 40%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
      position: 'relative',
    }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 0%, #C9A84C 50%, transparent 100%)' }} aria-hidden />

      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/dynasty_logo.png" alt="Dynasty" style={{ width: '200px', height: 'auto', objectFit: 'contain' }} />
        </div>

        <div style={{ background: 'rgba(17,17,17,0.97)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '2px', padding: '48px 44px', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 32px 80px rgba(0,0,0,0.8)', width: '100%', position: 'relative', boxSizing: 'border-box' }}>
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '18px', height: '18px', borderTop: '1px solid rgba(201,168,76,0.35)', borderLeft: '1px solid rgba(201,168,76,0.35)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '18px', height: '18px', borderTop: '1px solid rgba(201,168,76,0.35)', borderRight: '1px solid rgba(201,168,76,0.35)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '18px', height: '18px', borderBottom: '1px solid rgba(201,168,76,0.35)', borderLeft: '1px solid rgba(201,168,76,0.35)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '18px', height: '18px', borderBottom: '1px solid rgba(201,168,76,0.35)', borderRight: '1px solid rgba(201,168,76,0.35)' }} />

          <ConfirmForm
            tokenHash={tokenHash ?? ''}
            type={validType ?? ''}
            next={safeNext}
            isRecovery={isRecovery}
            initialError={initialError}
          />
        </div>
      </div>
    </div>
  )
}
