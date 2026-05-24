import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createCaptainSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  tournament_id: z.string().uuid(),
  team_id: z.string().uuid(),
})

// Tournament manager creates a captain login for a team
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profileData } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const profile = profileData as { role: string } | null
  if (profile?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = createCaptainSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { full_name, email, password, tournament_id, team_id } = parsed.data

  // Verify the team belongs to this tournament
  const { data: team } = await supabase
    .from('teams')
    .select('id, name, tournament_id')
    .eq('id', team_id)
    .eq('tournament_id', tournament_id)
    .maybeSingle()

  if (!team) {
    return NextResponse.json({ error: 'Team not found in this tournament' }, { status: 404 })
  }

  // Check if captain login already exists for this team
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 })
  }

  // Create the captain user via service role (no email confirmation)
  const adminClient = createAdminClient()
  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name,
      role: 'CAPTAIN',
      team_id,
      tournament_id,
    },
  })

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 })
  }

  // Explicitly set CAPTAIN role — trigger defaults to CAPTAIN but we set it to be safe
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (adminClient as any).from('profiles').update({ role: 'CAPTAIN' }).eq('id', newUser.user.id)

  return NextResponse.json({ user: newUser.user }, { status: 201 })
}
