export default function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{
        width: '24px', height: '24px',
        border: '2px solid rgba(201,168,76,0.15)',
        borderTopColor: '#C9A84C',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite'
      }} />
    </div>
  )
}
