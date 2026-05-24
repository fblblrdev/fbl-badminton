import { createClient } from '@/lib/supabase/server'
import { RankingService } from '@/services/ranking'
import { TournamentRepository } from '@/repositories/tournament'
import { Navbar } from '@/components/layout/Navbar'
import { PageHeader } from '@/components/layout/PageHeader'
import { RankingsTable } from '@/components/rankings/RankingsTable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  searchParams: Promise<{ tournament?: string }>
}

export default async function RankingsPage({ searchParams }: Props) {
  const { tournament: tournamentId } = await searchParams
  const supabase = await createClient()

  const rankingService = new RankingService(supabase)
  const tournamentRepo = new TournamentRepository(supabase)

  const [tournaments, rankings] = await Promise.all([
    tournamentRepo.findAll(),
    tournamentId
      ? rankingService.getRankings(tournamentId)
      : rankingService.getGlobalRankings(),
  ])

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <PageHeader
          title="Player Rankings"
          description="ELO-based player performance rankings"
        >
          <form method="get" className="flex items-center gap-2">
            <Select name="tournament" defaultValue={tournamentId ?? 'all'}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Tournaments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tournaments</SelectItem>
                {tournaments.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </form>
        </PageHeader>

        <RankingsTable rankings={rankings} />
      </main>
    </div>
  )
}
