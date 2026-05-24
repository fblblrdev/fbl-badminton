import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PlayerService } from '@/services/player'
import { playerSchema } from '@/lib/validations/player'
import { getAuthUser } from '@/lib/auth-helpers'


interface Params {
  params: Promise<{ id: string; playerId: string }>
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { playerId } = await params
    const supabase = await createClient()
    const auth = await getAuthUser(supabase)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = new PlayerService(supabase)
    const player = await service.getPlayerById(playerId)

    if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    return NextResponse.json({ data: player })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { playerId } = await params
    const supabase = await createClient()
    const auth = await getAuthUser(supabase)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const result = playerSchema.partial().safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const service = new PlayerService(supabase)
    const player = await service.updatePlayer(playerId, result.data)

    return NextResponse.json({ data: player })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { playerId } = await params
    const supabase = await createClient()
    const auth = await getAuthUser(supabase)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const service = new PlayerService(supabase)
    await service.deletePlayer(playerId)

    return NextResponse.json({ data: null })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
