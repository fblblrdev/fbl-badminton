import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createUserSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['SUPER_ADMIN', 'CAPTAIN']),
})

export async function POST(request: Request) {
  // Only super admin can create users
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profileData } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const profile = profileData as { role: string } | null
  if (profile?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { full_name, email, password, role } = parsed.data

  // Use admin client (service role) to create user — bypasses email confirmation
  const adminClient = createAdminClient()
  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role },
  })

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 })
  }

  // Explicitly set role on the profile — the DB trigger defaults to CAPTAIN
  // so we must update it after the user is created
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await (adminClient as any)
    .from('profiles')
    .update({ role })
    .eq('id', newUser.user.id)

  if (profileError) {
    // User was created but role is wrong — delete the auth user to avoid orphan
    await adminClient.auth.admin.deleteUser(newUser.user.id)
    return NextResponse.json({ error: 'Failed to set user role' }, { status: 500 })
  }

  return NextResponse.json({ user: newUser.user }, { status: 201 })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profileData2 } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const profile2 = profileData2 as { role: string } | null
  if (profile2?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ users: profiles })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profileData3 } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const profile3 = profileData3 as { role: string } | null
  if (profile3?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
  if (userId === user.id) return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })

  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.deleteUser(userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
