import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

interface Params {
  params: Promise<{ id: string; teamId: string }>
}

export async function DELETE(_request: Request, { params }: Params) {
  const { teamId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profileData } = await supabase
    .from('profiles').select('role').eq('id', user.id).maybeSingle()
  const profile = profileData as { role: string } | null
  if (profile?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Get team + captain player (to find auth user by email)
  const { data: teamData, error: teamError } = await supabase
    .from('teams')
    .select('id, captain:players!teams_captain_id_fkey(id, email)')
    .eq('id', teamId)
    .maybeSingle()

  if (teamError || !teamData) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 })
  }

  const team = teamData as unknown as { id: string; captain: { id: string; email: string | null } | null }

  // Delete the captain's auth user if they have an email
  const adminClient = createAdminClient()
  if (team.captain?.email) {
    const { data: userList } = await adminClient.auth.admin.listUsers()
    const captainUser = userList?.users?.find((u) => u.email === team.captain!.email)
    if (captainUser) {
      await adminClient.auth.admin.deleteUser(captainUser.id)
    }
  }

  // Delete the team (cascade removes team_players)
  const { error: deleteError } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
