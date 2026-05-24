import { createClient } from '@/lib/supabase/server'
import { TeamRepository } from '@/repositories/team'
import { PlayerRepository } from '@/repositories/player'
import { TournamentRepository } from '@/repositories/tournament'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Gavel, Users, Coins, Crown } from 'lucide-react'

export default async function CaptainPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Primary lookup: find captain player by email (set when team is created)
  const { data: captainPlayerData } = await supabase
    .from('players')
    .select('id')
    .eq('email', user.email ?? '')
    .eq('is_captain', true)
    .maybeSingle()

  const captainPlayer = captainPlayerData as { id: string } | null

  const teamRepo = new TeamRepository(supabase)

  let team = null
  if (captainPlayer?.id) {
    team = await teamRepo.findByCaptain(captainPlayer.id)
  }

  // Fallback: use team_id from auth user metadata (set when captain account is created)
  if (!team) {
    const teamId = user.user_metadata?.team_id as string | undefined
    if (teamId) {
      team = await teamRepo.findById(teamId)
    }
  }

  const players = team?.players ?? []
  const females = players.filter((p) => p.gender === 'female').length

  return (
    <div>
      <PageHeader title="My Team" description="Manage your squad and participate in auctions" />

      {!team ? (
        <div className="text-center py-16">
          <Crown className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">You don&apos;t have a team yet.</p>
          <p className="text-slate-500 text-sm">Contact your tournament manager to be assigned.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{team.name}</span>
                  <Button asChild size="sm">
                    <Link href={`/auction/${team.tournament_id}`}>
                      <Gavel className="h-3.5 w-3.5 mr-1.5" />
                      Auction
                    </Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                    <Coins className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Balance</p>
                    <p className="text-lg font-bold text-emerald-400">{team.balance.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                    <Users className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Players</p>
                    <p className="text-lg font-bold text-white">{players.length}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                    <Users className="h-4 w-4 text-pink-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Female</p>
                    <p className="text-lg font-bold text-white">{females}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Squad</h3>
                  {players.map((player) => {
                    const initials = player.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                    return (
                      <div key={player.id} className="flex items-center gap-3 p-2.5 bg-slate-800/30 rounded-md">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-blue-900/40 text-blue-300">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{player.name}</p>
                          <p className="text-xs text-slate-500 capitalize">{player.gender}</p>
                        </div>
                        {player.skill_category && (
                          <Badge variant="outline" className="text-xs">{player.skill_category.name}</Badge>
                        )}
                      </div>
                    )
                  })}
                  {players.length === 0 && (
                    <p className="text-slate-500 text-sm py-4 text-center">No players in your squad yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-slate-400 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/auction/${team.tournament_id}`}>
                      <Gavel className="h-4 w-4 mr-2" />
                      Join Auction
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/rankings">View Rankings</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
