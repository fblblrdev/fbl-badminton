import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PlayerService } from '@/services/player'
import { playerSchema } from '@/lib/validations/player'
import { getAuthUser } from '@/lib/auth-helpers'


interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const auth = await getAuthUser(supabase)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = new PlayerService(supabase)
    const players = await service.getPlayersByTournament(id)

    return NextResponse.json({ data: players })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
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

    if (body.players && Array.isArray(body.players)) {
      const service = new PlayerService(supabase)
      const players = await service.bulkCreateFromCSV(id, body.players)
      return NextResponse.json({ data: players }, { status: 201 })
    }

    const result = playerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const service = new PlayerService(supabase)
    const player = await service.createPlayer(id, result.data)

    return NextResponse.json({ data: player }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
