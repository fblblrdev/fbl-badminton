import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuctionService } from '@/services/auction'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tournamentId = searchParams.get('tournament_id')

    if (!tournamentId) {
      return NextResponse.json({ error: 'tournament_id is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = new AuctionService(supabase)
    const state = await service.getAuctionState(tournamentId)

    return NextResponse.json({ data: state })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
