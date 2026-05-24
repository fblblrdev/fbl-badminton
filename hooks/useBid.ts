'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
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
      const supabase = createClient()
      const { data: bid, error } = await supabase
        .from('auction_bids')
        .insert({
          session_id: data.session_id,
          player_id: data.player_id,
          team_id: data.team_id,
          amount: data.amount,
          is_winning: true,
        })
        .select('*, team:teams(*), player:players(*)')
        .single()

      if (error) throw new Error(error.message)
      return bid
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.AUCTION_STATE, tournamentId],
      })
    },
  })
}
