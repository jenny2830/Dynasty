import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: landlord } = await supabase
    .from('landlords')
    .select('theme_preference')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: '#080808' }}>
      <Sidebar
        userId={user.id}
        initialTheme={landlord?.theme_preference ?? 'dark'}
      />
      <main className="dashboard-main" style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: '#0A0A0A',
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 60px, rgba(201,168,76,0.008) 60px, rgba(201,168,76,0.008) 61px), repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(201,168,76,0.008) 60px, rgba(201,168,76,0.008) 61px)',
        position: 'relative',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
      </main>
    </div>
  )
}
