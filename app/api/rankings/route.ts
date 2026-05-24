import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RankingService } from '@/services/ranking'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tournamentId = searchParams.get('tournament_id')

    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = new RankingService(supabase)
    const rankings = tournamentId
      ? await service.getRankings(tournamentId)
      : await service.getGlobalRankings()

    return NextResponse.json({ data: rankings })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
