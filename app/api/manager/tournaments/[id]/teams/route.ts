import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { TeamRepository } from '@/repositories/team'
import { PlayerRepository } from '@/repositories/player'

const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100),
  captain_player_id: z.string().uuid('Select a captain player'),
  captain_email: z.string().email('Valid email required'),
  captain_password: z.string().min(6, 'Password must be at least 6 characters'),
})

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: Params) {
  const { id: tournamentId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profileData } = await supabase
    .from('profiles').select('role').eq('id', user.id).maybeSingle()
  const profile = profileData as { role: string } | null
  if (profile?.role !== 'TOURNAMENT_MANAGER' && profile?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = createTeamSchema.safeParse(body)
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? 'Invalid input'
    return NextResponse.json({ error: first }, { status: 400 })
  }

  const { name, captain_player_id, captain_email, captain_password } = parsed.data

  // Verify tournament exists — managers may only create teams in their assigned tournament
  const { data: tournament } = await supabase
    .from('tournaments').select('id, auction_points, manager_id').eq('id', tournamentId).maybeSingle()
  if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })

  const t = tournament as { id: string; auction_points: number; manager_id: string | null }
  if (profile?.role === 'TOURNAMENT_MANAGER' && t.manager_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden: you are not assigned to this tournament' }, { status: 403 })
  }

  const playerRepo = new PlayerRepository(supabase)
  const captainPlayer = await playerRepo.findById(captain_player_id)
  if (!captainPlayer || captainPlayer.tournament_id !== tournamentId) {
    return NextResponse.json({ error: 'Player not found in this tournament' }, { status: 404 })
  }

  // Check email not already taken
  const { data: existing } = await supabase
    .from('profiles').select('id').eq('email', captain_email).maybeSingle()
  if (existing) {
    return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 })
  }

  // 1. Create the team
  const teamRepo = new TeamRepository(supabase)
  let team
  try {
    team = await teamRepo.create({
      tournament_id: tournamentId,
      name,
      captain_id: captain_player_id,
      balance: t.auction_points,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create team' },
      { status: 500 }
    )
  }

  // 2. Create captain auth user
  const adminClient = createAdminClient()
  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email: captain_email,
    password: captain_password,
    email_confirm: true,
    user_metadata: {
      full_name: `Captain - ${name}`,
      role: 'CAPTAIN',
      team_id: team.id,
      tournament_id: tournamentId,
    },
  })

  if (createError) {
    // Roll back team creation
    await supabase.from('teams').delete().eq('id', team.id)
    return NextResponse.json({ error: createError.message }, { status: 400 })
  }

  // 3. Fix role on the profile (trigger defaults to CAPTAIN but let's be explicit)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (adminClient as any).from('profiles').update({ role: 'CAPTAIN' }).eq('id', newUser.user.id)

  // 4. Store the captain's login email on the player record so the captain page can look them up
  await playerRepo.update(captain_player_id, { email: captain_email })

  return NextResponse.json({
    team,
    captain: {
      email: captain_email,
      password: captain_password,
      full_name: `Captain - ${name}`,
    },
  }, { status: 201 })
}
