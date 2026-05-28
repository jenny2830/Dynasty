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
    <div className="flex min-h-screen w-full bg-dynasty-black">
      <Sidebar
        userId={user.id}
        initialTheme={landlord?.theme_preference ?? 'dark'}
      />
      <main className="min-w-0 flex-1 px-10 py-8">{children}</main>
    </div>
  )
}
