import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import { TournamentRepository } from '@/repositories/tournament'
import { PlayerRepository } from '@/repositories/player'
import { TeamRepository } from '@/repositories/team'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MapPin, Calendar, Gavel, Users, Timer, ChevronRight } from 'lucide-react'
import { TOURNAMENT_STATUS } from '@/lib/constants'

interface Props {
  params: Promise<{ id: string }>
}

export default async function TournamentDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const tournamentRepo = new TournamentRepository(supabase)
  const playerRepo = new PlayerRepository(supabase)
  const teamRepo = new TeamRepository(supabase)

  const [tournament, categories, players, teams] = await Promise.all([
    tournamentRepo.findById(id),
    tournamentRepo.findSkillCategories(id),
    playerRepo.findByTournament(id),
    teamRepo.findByTournament(id),
  ])

  if (!tournament) notFound()

  const captains = players.filter((p) => p.is_captain)
  const statusVariant = {
    draft: 'secondary' as const,
    active: 'success' as const,
    completed: 'outline' as const,
  }

  return (
    <div>
      <PageHeader title={tournament.name}>
        <Badge variant={statusVariant[tournament.status]} className="text-sm">
          {TOURNAMENT_STATUS[tournament.status]}
        </Badge>
        <Button asChild>
          <Link href={`/auction/${tournament.id}`}>
            <Gavel className="h-4 w-4 mr-2" />
            Auction
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-base">Tournament Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="h-4 w-4 text-slate-500" />
                {tournament.venue}
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="h-4 w-4 text-slate-500" />
                {format(new Date(tournament.start_date), 'MMM d, yyyy')} &ndash;{' '}
                {format(new Date(tournament.end_date), 'MMM d, yyyy')}
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Auction Points</p>
                  <p className="text-lg font-bold text-white">{tournament.auction_points.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Increment</p>
                  <p className="text-lg font-bold text-white">{tournament.auction_increment}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Timer</p>
                  <p className="text-lg font-bold text-white">{tournament.timer_seconds}s</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Skill Categories</CardTitle>
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/tournaments/${id}/players`}>Manage Players</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-md">
                  <span className="font-medium text-white">{cat.name}</span>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>{cat.base_price.toLocaleString()} pts</span>
                    <span>{cat.min_players}–{cat.max_players} players</span>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-slate-500 text-sm">No skill categories defined</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-base">Quick Stats</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Total Players</span>
                <span className="text-white font-semibold">{players.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Captains</span>
                <span className="text-white font-semibold">{captains.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Teams</span>
                <span className="text-white font-semibold">{teams.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Team Size</span>
                <span className="text-white font-semibold">
                  {tournament.min_team_size}–{tournament.max_team_size}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Female Players</span>
                <span className="text-white font-semibold">
                  {tournament.min_female_players}–{tournament.max_female_players}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button asChild className="w-full" variant="outline">
              <Link href={`/admin/tournaments/${id}/players`}>
                <Users className="h-4 w-4 mr-2" />
                Players ({players.length})
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Link>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link href={`/admin/tournaments/${id}/teams`}>
                <Users className="h-4 w-4 mr-2" />
                Teams ({teams.length})
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Link>
            </Button>
            <Button asChild className="w-full">
              <Link href={`/auction/${id}`}>
                <Gavel className="h-4 w-4 mr-2" />
                Go to Auction
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
