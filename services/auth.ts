import { createClient } from '@/lib/supabase/client'
import type { Profile, AuthUser } from '@/types'

export async function loginWithEmail(email: string, password: string): Promise<AuthUser> {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Login failed')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  return {
    id: data.user.id,
    email: data.user.email ?? '',
    profile: profile as Profile | null,
  }
}

export async function logout(): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email ?? '',
    profile: profile as Profile | null,
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data as Profile
}
