import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TournamentRepository } from '@/repositories/tournament'
import { TeamRepository } from '@/repositories/team'
import { PlayerRepository } from '@/repositories/player'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreateTeamForm } from '@/components/teams/CreateTeamForm'
import { CreateCaptainButton } from '@/components/auth/CreateCaptainButton'
import { Users } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ManagerTeamsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tournamentRepo = new TournamentRepository(supabase)
  const teamRepo = new TeamRepository(supabase)
  const playerRepo = new PlayerRepository(supabase)

  const [tournament, teams, captainPlayers] = await Promise.all([
    tournamentRepo.findById(id),
    teamRepo.findByTournament(id),
    playerRepo.findCaptains(id),
  ])

  if (!tournament) notFound()

  // Captain players not yet assigned to a team
  const assignedCaptainIds = new Set(teams.map((t) => t.captain_id))
  const availableCaptains = captainPlayers.filter((p) => !assignedCaptainIds.has(p.id))

  return (
    <div className="space-y-8">
      <PageHeader
        title="Teams & Captain Logins"
        description={`Set up teams and generate captain credentials for ${tournament.name}`}
      />

      {captainPlayers.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            No captain players found. Upload players and mark some as captains first.
          </p>
        </div>
      ) : (
        <CreateTeamForm tournamentId={id} captainPlayers={availableCaptains} />
      )}

      {teams.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Teams ({teams.length})</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <Card key={team.id}>
                <CardContent className="p-5 space-y-3">
                  <div>
                    <p className="font-semibold text-white">{team.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Captain: {team.captain?.name ?? '—'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Balance: {team.balance.toLocaleString()} pts
                    </span>
                    <CreateCaptainButton
                      team={{ id: team.id, name: team.name }}
                      tournamentId={id}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
