import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TournamentRepository } from '@/repositories/tournament'
import { TeamRepository } from '@/repositories/team'
import { PlayerRepository } from '@/repositories/player'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CreateTeamForm } from '@/components/teams/CreateTeamForm'
import { Crown, Users } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function TeamsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const tournamentRepo = new TournamentRepository(supabase)
  const teamRepo = new TeamRepository(supabase)
  const playerRepo = new PlayerRepository(supabase)

  const [tournament, teams, captainPlayers] = await Promise.all([
    tournamentRepo.findById(id),
    teamRepo.findByTournament(id),
    playerRepo.findCaptains(id),
  ])

  if (!tournament) notFound()

  const assignedCaptainIds = new Set(teams.map((t) => t.captain_id))
  const availableCaptains = captainPlayers.filter((p) => !assignedCaptainIds.has(p.id))

  return (
    <div className="space-y-8">
      <PageHeader
        title="Teams"
        description={`${teams.length} team${teams.length !== 1 ? 's' : ''} in ${tournament.name}`}
      />

      <CreateTeamForm tournamentId={id} captainPlayers={availableCaptains} />

      {teams.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400">No teams yet. Add one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {teams.map((team) => {
            const players = team.players ?? []
            const females = players.filter((p) => p.gender === 'female').length

            return (
              <Card key={team.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{team.name}</CardTitle>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-400">
                        {team.balance.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">pts remaining</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {team.captain && (
                    <div className="flex items-center gap-2 p-2 bg-amber-950/20 border border-amber-900/30 rounded-md">
                      <Crown className="h-4 w-4 text-amber-400 flex-shrink-0" />
                      <span className="text-sm text-amber-300 font-medium">{team.captain.name}</span>
                      <Badge variant="warning" className="text-xs ml-auto">Captain</Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Users className="h-3.5 w-3.5" />
                    <span>{players.length} players ({females} female)</span>
                  </div>

                  {players.length > 0 && (
                    <div className="space-y-1.5">
                      {players.map((player) => {
                        const initials = player.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                        return (
                          <div key={player.id} className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-slate-700">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-slate-300">{player.name}</span>
                            {player.skill_category && (
                              <Badge variant="outline" className="text-xs ml-auto">
                                {player.skill_category.name}
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
