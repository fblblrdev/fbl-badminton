import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuctionService } from '@/services/auction'
import { TeamRepository } from '@/repositories/team'
import { placeBidSchema } from '@/lib/validations/auction'
import { getAuthUser } from '@/lib/auth-helpers'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const auth = await getAuthUser(supabase)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (auth.role !== 'CAPTAIN' && auth.role !== 'SUPER_ADMIN' && auth.role !== 'TOURNAMENT_MANAGER') {
      return NextResponse.json({ error: 'Forbidden: Only captains can place bids' }, { status: 403 })
    }

    const body = await request.json()
    const result = placeBidSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    if (auth.role === 'CAPTAIN') {
      const teamRepo = new TeamRepository(supabase)
      const team = await teamRepo.findById(result.data.team_id)
      if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    const service = new AuctionService(supabase)
    const bid = await service.placeBid(
      result.data.session_id,
      result.data.player_id,
      result.data.team_id,
      result.data.amount
    )

    return NextResponse.json({ data: bid }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
