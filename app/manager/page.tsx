import { createClient } from '@/lib/supabase/server'
import { TournamentRepository } from '@/repositories/tournament'
import { PageHeader } from '@/components/layout/PageHeader'
import { TournamentCard } from '@/components/tournament/TournamentCard'

export default async function ManagerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const repo = new TournamentRepository(supabase)
  const tournaments = await repo.findByManager(user.id)

  return (
    <div>
      <PageHeader
        title="My Tournaments"
        description="Tournaments you manage"
      />

      {tournaments.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400">No tournaments assigned to you yet.</p>
          <p className="text-slate-500 text-sm mt-1">Contact your admin to be assigned to a tournament.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} role="TOURNAMENT_MANAGER" />
          ))}
        </div>
      )}
    </div>
  )
}
