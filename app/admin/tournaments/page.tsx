import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { TournamentRepository } from '@/repositories/tournament'
import { PageHeader } from '@/components/layout/PageHeader'
import { TournamentCard } from '@/components/tournament/TournamentCard'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'

export default async function TournamentsPage() {
  const supabase = await createClient()
  const repo = new TournamentRepository(supabase)
  const tournaments = await repo.findAll()

  return (
    <div>
      <PageHeader
        title="Tournaments"
        description="Manage all badminton tournaments"
      >
        <Button asChild>
          <Link href={ROUTES.ADMIN_NEW_TOURNAMENT}>
            <Plus className="h-4 w-4 mr-2" />
            New Tournament
          </Link>
        </Button>
      </PageHeader>

      {tournaments.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 mb-4">No tournaments created yet.</p>
          <Button asChild>
            <Link href={ROUTES.ADMIN_NEW_TOURNAMENT}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Tournament
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} role="SUPER_ADMIN" />
          ))}
        </div>
      )}
    </div>
  )
}
