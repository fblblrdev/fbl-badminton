import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TournamentService } from '@/services/tournament'
import { tournamentSchema } from '@/lib/validations/tournament'
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

    const service = new TournamentService(supabase)
    const tournament = await service.getTournamentById(id)

    if (!tournament) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ data: tournament })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const auth = await getAuthUser(supabase)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (auth.role !== 'SUPER_ADMIN' && auth.role !== 'TOURNAMENT_MANAGER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const result = tournamentSchema.partial().safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const service = new TournamentService(supabase)
    const tournament = await service.updateTournament(id, result.data, auth.user.id, auth.role ?? undefined)

    return NextResponse.json({ data: tournament })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const auth = await getAuthUser(supabase)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Only super admins can delete tournaments' }, { status: 403 })
    }

    const service = new TournamentService(supabase)
    await service.deleteTournament(id, auth.user.id, auth.role ?? undefined)

    return NextResponse.json({ data: null })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
