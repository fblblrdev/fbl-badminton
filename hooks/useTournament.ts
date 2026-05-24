'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants'
import type { Tournament, SkillCategory } from '@/types'
import type { TournamentFormValues } from '@/lib/validations/tournament'

async function fetchTournaments(): Promise<Tournament[]> {
  const res = await fetch('/api/tournaments')
  if (!res.ok) throw new Error('Failed to fetch tournaments')
  const json = await res.json()
  return json.data
}

async function fetchTournament(id: string): Promise<Tournament> {
  const res = await fetch(`/api/tournaments/${id}`)
  if (!res.ok) throw new Error('Failed to fetch tournament')
  const json = await res.json()
  return json.data
}

async function fetchSkillCategories(tournamentId: string): Promise<SkillCategory[]> {
  const res = await fetch(`/api/tournaments/${tournamentId}/categories`)
  if (!res.ok) throw new Error('Failed to fetch skill categories')
  const json = await res.json()
  return json.data ?? []
}

export function useTournaments() {
  return useQuery({
    queryKey: [QUERY_KEYS.TOURNAMENTS],
    queryFn: fetchTournaments,
  })
}

export function useTournament(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.TOURNAMENT, id],
    queryFn: () => fetchTournament(id),
    enabled: !!id,
  })
}

export function useSkillCategories(tournamentId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.TOURNAMENTS, tournamentId, 'categories'],
    queryFn: () => fetchSkillCategories(tournamentId),
    enabled: !!tournamentId,
  })
}

export function useCreateTournament() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TournamentFormValues & { manager_id?: string }) => {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to create tournament')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOURNAMENTS] })
    },
  })
}

export function useUpdateTournament(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<TournamentFormValues>) => {
      const res = await fetch(`/api/tournaments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to update tournament')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOURNAMENTS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOURNAMENT, id] })
    },
  })
}

export function useDeleteTournament() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tournaments/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to delete tournament')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOURNAMENTS] })
    },
  })
}
