import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth-helpers'
import { MatchService } from '@/services/match'
import { RankingService } from '@/services/ranking'
import { z } from 'zod'

const schema = z.object({
  home_score: z.number().int().min(0),
  away_score: z.number().int().min(0),
  winner_team_id: z.string().uuid().nullable(),
})

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const auth = await getAuthUser(supabase)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const result = schema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const matchService = new MatchService(supabase)
    const score = await matchService.updateScore(
      id,
      result.data.home_score,
      result.data.away_score,
      result.data.winner_team_id
    )

    if (result.data.winner_team_id) {
      const rankingService = new RankingService(supabase)
      await rankingService.updateRankingsAfterMatch(id, result.data.winner_team_id)
    }

    return NextResponse.json({ data: score })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
