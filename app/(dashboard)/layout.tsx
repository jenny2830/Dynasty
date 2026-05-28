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
    <div className="flex min-h-screen bg-dynasty-black">
      <Sidebar
        userId={user.id}
        initialTheme={landlord?.theme_preference ?? 'dark'}
      />
      <main className="ml-60 flex-1 min-h-screen p-8">
        <div className="mx-auto max-w-[1400px]">{children}</div>
      </main>
    </div>
  )
}
