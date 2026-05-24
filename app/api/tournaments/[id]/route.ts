import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

    if (auth.role !== 'SUPER_ADMIN') {
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

    const admin = createAdminClient()

    // Delete in FK-safe order: bids → results → sessions → team_players → teams → rest (cascades handle players/fixtures/etc)
    const { data: sessions } = await admin.from('auction_sessions').select('id').eq('tournament_id', id)
    const sessionIds = (sessions ?? []).map((s) => s.id)

    if (sessionIds.length > 0) {
      await admin.from('auction_bids').delete().in('session_id', sessionIds)
      await admin.from('auction_results').delete().in('session_id', sessionIds)
      await admin.from('auction_sessions').delete().in('id', sessionIds)
    }

    const { data: teams } = await admin.from('teams').select('id').eq('tournament_id', id)
    const teamIds = (teams ?? []).map((t) => t.id)
    if (teamIds.length > 0) {
      await admin.from('team_players').delete().in('team_id', teamIds)
      await admin.from('teams').delete().in('id', teamIds)
    }

    await admin.from('tournaments').delete().eq('id', id)

    return NextResponse.json({ data: null })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
