export function generateFingerprint(): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Dynasty fingerprint', 2, 2)
  }

  const nav = navigator as Navigator & { deviceMemory?: number }
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth?.toString(),
    new Date().getTimezoneOffset().toString(),
    canvas.toDataURL(),
    navigator.hardwareConcurrency?.toString(),
    nav.deviceMemory?.toString(),
  ].filter(Boolean).join('|')

  let hash = 0
  for (let i = 0; i < components.length; i++) {
    const char = components.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return 'fp_' + Math.abs(hash).toString(36)
}
