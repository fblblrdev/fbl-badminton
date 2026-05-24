import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MatchRepository } from '@/repositories/match'
import { Navbar } from '@/components/layout/Navbar'
import { PageHeader } from '@/components/layout/PageHeader'
import { MatchScorer } from '@/components/matches/MatchScorer'
import { Badge } from '@/components/ui/badge'
import { MATCH_TYPES } from '@/lib/constants'

interface Props {
  params: Promise<{ id: string }>
}

export default async function MatchDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id ?? '')
    .maybeSingle()
  const profile = profileData as { role: string } | null

  const matchRepo = new MatchRepository(supabase)
  const match = await matchRepo.findById(id)

  if (!match) notFound()

  const canScore = profile?.role === 'SUPER_ADMIN'

  const statusVariant = {
    pending: 'secondary' as const,
    in_progress: 'warning' as const,
    completed: 'success' as const,
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <PageHeader title="Match Details">
          <Badge variant={statusVariant[match.status]} className="capitalize">
            {match.status.replace('_', ' ')}
          </Badge>
        </PageHeader>

        <div className="mb-4">
          <p className="text-slate-400 text-sm">{MATCH_TYPES[match.type]}</p>
        </div>

        <MatchScorer match={match} canScore={canScore} />
      </main>
    </div>
  )
}
