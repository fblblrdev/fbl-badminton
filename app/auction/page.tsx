import { createClient } from '@/lib/supabase/server'
import { TournamentRepository } from '@/repositories/tournament'
import { PageHeader } from '@/components/layout/PageHeader'
import { TournamentCard } from '@/components/tournament/TournamentCard'
import { Navbar } from '@/components/layout/Navbar'

export default async function AuctionListPage() {
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
  const active = tournaments.filter((t) => t.status === 'active')

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <PageHeader
          title="Auctions"
          description="Active tournament auctions"
        />

        {active.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400">No active auctions at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {active.map((t) => (
              <TournamentCard key={t.id} tournament={t} role={profile?.role} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
