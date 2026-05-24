import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth-helpers'
import { AuctionService } from '@/services/auction'
import { confirmBidSchema } from '@/lib/validations/auction'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const auth = await getAuthUser(supabase)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Only admins can confirm bids' }, { status: 403 })
    }

    const body = await request.json()
    const result = confirmBidSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const service = new AuctionService(supabase)
    const { result: auctionResult, session } = await service.confirmBidAndAdvance(
      result.data.session_id,
      result.data.player_id,
      result.data.team_id,
      result.data.amount
    )

    return NextResponse.json({ data: { result: auctionResult, session } }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
