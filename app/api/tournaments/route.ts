import { getAuthUser } from '@/lib/auth-helpers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TournamentService } from '@/services/tournament'
import { tournamentSchema } from '@/lib/validations/tournament'


export async function GET() {
  try {
    const supabase = await createClient()
    const auth = await getAuthUser(supabase)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = new TournamentService(supabase)
    const tournaments = auth.role === 'SUPER_ADMIN'
      ? await service.getAllTournaments()
      : auth.role === 'TOURNAMENT_MANAGER'
        ? await service.getTournamentsByManager(auth.user.id)
        : await service.getTournamentsByCreator(auth.user.id)

    return NextResponse.json({ data: tournaments })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const auth = await getAuthUser(supabase)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (auth.role !== 'SUPER_ADMIN' && auth.role !== 'TOURNAMENT_MANAGER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const result = tournamentSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const managerId = body.manager_id as string | undefined

    const service = new TournamentService(supabase)
    const { tournament, categories } = await service.createTournament(result.data, auth.user.id, managerId)

    return NextResponse.json({ data: { tournament, categories } }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
