'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants'

export function usePlaceBid(tournamentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      session_id: string
      player_id: string
      team_id: string
      amount: number
    }) => {
      const res = await fetch('/api/auction/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to place bid')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.AUCTION_STATE, tournamentId],
      })
    },
  })
}
