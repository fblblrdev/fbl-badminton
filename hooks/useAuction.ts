'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants'
import type { AuctionState } from '@/types'

async function fetchAuctionState(tournamentId: string): Promise<AuctionState> {
  const res = await fetch(`/api/auction/state?tournament_id=${tournamentId}`)
  if (!res.ok) throw new Error('Failed to fetch auction state')
  const json = await res.json()
  return json.data
}

export function useAuctionState(tournamentId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.AUCTION_STATE, tournamentId],
    queryFn: () => fetchAuctionState(tournamentId),
    enabled: !!tournamentId,
    refetchInterval: 5000,
  })
}

export function useStartAuction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tournamentId: string) => {
      const res = await fetch('/api/auction/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournament_id: tournamentId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to start auction')
      }
      return res.json()
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.AUCTION_STATE, tournamentId],
      })
    },
  })
}

export function useConfirmBid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      session_id: string
      player_id: string
      team_id: string
      amount: number
      tournament_id: string
    }) => {
      const res = await fetch('/api/auction/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to confirm bid')
      }
      return res.json()
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.AUCTION_STATE, vars.tournament_id],
      })
    },
  })
}

export function useNextPlayer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { session_id: string; tournament_id: string }) => {
      const res = await fetch('/api/auction/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: data.session_id }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to move to next player')
      }
      return res.json()
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.AUCTION_STATE, vars.tournament_id],
      })
    },
  })
}
