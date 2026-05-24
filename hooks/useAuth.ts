'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { AuthUser, Profile } from '@/types'
import { QUERY_KEYS, ROUTES } from '@/lib/constants'

async function fetchCurrentUser(): Promise<AuthUser | null> {
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

export function useAuth() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: user, isLoading, error } = useQuery({
    queryKey: [QUERY_KEYS.PROFILE],
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.clear()
      router.push(ROUTES.LOGIN)
    },
  })

  return {
    user,
    profile: user?.profile ?? null,
    role: user?.profile?.role ?? null,
    isLoading,
    error,
    isAuthenticated: !!user,
    isSuperAdmin: user?.profile?.role === 'SUPER_ADMIN',
    isCaptain: user?.profile?.role === 'CAPTAIN',
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  }
}
