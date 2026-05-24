import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  const profile = profileData as { role: string } | null

  if (profile?.role !== 'TOURNAMENT_MANAGER' && profile?.role !== 'SUPER_ADMIN') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="flex">
        <Sidebar type="manager" />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
