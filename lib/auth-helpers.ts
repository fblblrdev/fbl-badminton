import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, UserRole } from '@/types/database'

export interface AuthResult {
  user: { id: string; email?: string }
  role: UserRole | null
}

export async function getAuthUser(
  supabase: SupabaseClient<Database>
): Promise<AuthResult | null> {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return {
    user: { id: user.id, email: user.email },
    role: (profile as { role: UserRole } | null)?.role ?? null,
  }
}

export function isAdminRole(role: UserRole | null): boolean {
  return role === 'SUPER_ADMIN'
}
