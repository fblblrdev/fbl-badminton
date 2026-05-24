'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { QUERY_KEYS } from '@/lib/constants'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useAuctionRealtime(tournamentId: string, sessionId: string | undefined) {
  const queryClient = useQueryClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!tournamentId || !sessionId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`auction:${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'auction_bids',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.AUCTION_STATE, tournamentId],
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'auction_sessions',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.AUCTION_STATE, tournamentId],
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'auction_results',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.AUCTION_STATE, tournamentId],
          })
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [tournamentId, sessionId, queryClient])
}

export function useTeamRealtime(tournamentId: string) {
  const queryClient = useQueryClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!tournamentId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`teams:${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teams',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.AUCTION_STATE, tournamentId],
          })
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [tournamentId, queryClient])
}

export function useMatchRealtime(matchId: string) {
  const queryClient = useQueryClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!matchId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`match:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_scores',
          filter: `match_id=eq.${matchId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.MATCH, matchId],
          })
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [matchId, queryClient])
}
