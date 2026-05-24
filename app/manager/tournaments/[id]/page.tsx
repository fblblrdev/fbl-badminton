import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TournamentRepository } from '@/repositories/tournament'
import { PlayerRepository } from '@/repositories/player'
import { TeamRepository } from '@/repositories/team'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gavel, Users, ChevronRight } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ManagerTournamentPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tournamentRepo = new TournamentRepository(supabase)
  const playerRepo = new PlayerRepository(supabase)
  const teamRepo = new TeamRepository(supabase)

  const [tournament, players, teams] = await Promise.all([
    tournamentRepo.findById(id),
    playerRepo.findByTournament(id),
    teamRepo.findByTournament(id),
  ])

  if (!tournament) notFound()

  return (
    <div>
      <PageHeader title={tournament.name} description="Tournament overview">
        <Button asChild>
          <Link href={`/auction/${id}`}>
            <Gavel className="h-4 w-4 mr-2" />
            Manage Auction
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-400 mb-1">Players</p>
            <p className="text-3xl font-bold text-white">{players.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-400 mb-1">Teams</p>
            <p className="text-3xl font-bold text-white">{teams.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-400 mb-1">Status</p>
            <p className="text-xl font-bold text-white capitalize">{tournament.status}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2 max-w-sm">
        <Button asChild variant="outline" className="w-full justify-between">
          <Link href={`/manager/tournaments/${id}/players`}>
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Players ({players.length})
            </span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-between">
          <Link href={`/manager/tournaments/${id}/teams`}>
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Logins ({teams.length})
            </span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-between">
          <Link href={`/fixtures/${id}`}>
            <span className="flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              Fixtures
            </span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
