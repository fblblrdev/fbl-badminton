import { createClient } from '@/lib/supabase/server'
import { TournamentRepository } from '@/repositories/tournament'
import { FixtureRepository } from '@/repositories/fixture'
import { PageHeader } from '@/components/layout/PageHeader'
import { FixtureCard } from '@/components/fixtures/FixtureCard'
import { FixtureGenerator } from '@/components/fixtures/FixtureGenerator'
import { Navbar } from '@/components/layout/Navbar'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ tournamentId: string }>
}

export default async function TournamentFixturesPage({ params }: Props) {
  const { tournamentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id ?? '')
    .maybeSingle()
  const profile = profileData as { role: string } | null

  const tournamentRepo = new TournamentRepository(supabase)
  const fixtureRepo = new FixtureRepository(supabase)

  const [tournament, fixtures] = await Promise.all([
    tournamentRepo.findById(tournamentId),
    fixtureRepo.findByTournament(tournamentId),
  ])

  if (!tournament) notFound()

  const canManage = profile?.role === 'SUPER_ADMIN' || profile?.role === 'TOURNAMENT_MANAGER'

  const rounds = fixtures.reduce<Record<number, typeof fixtures>>((acc, f) => {
    const r = f.round
    if (!acc[r]) acc[r] = []
    acc[r].push(f)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <PageHeader
          title="Fixtures"
          description={tournament.name}
        >
          {canManage && <FixtureGenerator tournamentId={tournamentId} />}
        </PageHeader>

        {fixtures.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400">No fixtures generated yet.</p>
            {canManage && (
              <p className="text-slate-500 text-sm mt-1">Use the generator above to create fixtures.</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(rounds)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([round, roundFixtures]) => (
                <div key={round}>
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Round {round}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {roundFixtures.map((fixture) => (
                      <FixtureCard key={fixture.id} fixture={fixture} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  )
}
