import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = (profileData as { role: string } | null)?.role

  if (role === 'SUPER_ADMIN') redirect('/admin')
  if (role === 'TOURNAMENT_MANAGER') redirect('/manager')
  if (role === 'CAPTAIN') redirect('/captain')

  // Profile missing or unknown role — show a plain waiting screen instead of looping
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-white text-lg font-semibold">Account setup incomplete</p>
        <p className="text-slate-400 text-sm mt-2">Your profile role has not been assigned. Contact your administrator.</p>
      </div>
    </div>
  )
}
