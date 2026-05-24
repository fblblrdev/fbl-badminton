import { createClient } from '@/lib/supabase/server'
import { TournamentRepository } from '@/repositories/tournament'
import { PageHeader } from '@/components/layout/PageHeader'
import { TournamentCard } from '@/components/tournament/TournamentCard'
import { Navbar } from '@/components/layout/Navbar'

export default async function FixturesIndexPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id ?? '')
    .maybeSingle()
  const profile = profileData as { role: string } | null

  const repo = new TournamentRepository(supabase)
  const tournaments = await repo.findAll()

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <PageHeader title="Fixtures" description="Browse tournament fixtures" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} role={profile?.role} />
          ))}
        </div>
      </main>
    </div>
  )
}
