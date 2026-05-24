import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { PageHeader } from '@/components/layout/PageHeader'

export default async function MatchesPage() {
  const supabase = await createClient()

  type MatchRow = {
    id: string
    type: string
    status: string
    fixture?: {
      round: number
      tournament?: { name: string }
      home_team?: { name: string }
      away_team?: { name: string }
    }
  }

  const { data: matchesData } = await supabase
    .from('matches')
    .select(`
      *,
      fixture:fixtures(
        *,
        tournament:tournaments(name),
        home_team:teams!fixtures_home_team_id_fkey(name),
        away_team:teams!fixtures_away_team_id_fkey(name)
      ),
      match_players(*, player:players(name), team:teams(name)),
      match_scores(*)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  const matches = (matchesData ?? []) as unknown as MatchRow[]

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <PageHeader title="Matches" description="All matches across tournaments" />

        <div className="space-y-3">
          {(matches ?? []).map((match) => (
            <div
              key={match.id}
              className="p-4 rounded-lg border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <p className="font-medium text-white">
                    {match.fixture?.tournament?.name ?? 'Unknown Tournament'}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {match.type?.replace('_', ' ')} &bull; Round {match.fixture?.round}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400">
                    {match.fixture?.home_team?.name} vs {match.fixture?.away_team?.name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    match.status === 'completed' ? 'bg-emerald-900/50 text-emerald-400' :
                    match.status === 'in_progress' ? 'bg-amber-900/50 text-amber-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {match.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {(!matches || matches.length === 0) && (
            <div className="text-center py-16 text-slate-500">
              No matches recorded yet.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
