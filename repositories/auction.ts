import { BaseRepository } from './base'
import type { AuctionSession, AuctionBid, AuctionResult } from '@/types'
import type { Database } from '@/types/database'

type AuctionSessionInsert = Database['public']['Tables']['auction_sessions']['Insert']
type AuctionSessionUpdate = Database['public']['Tables']['auction_sessions']['Update']
type AuctionBidInsert = Database['public']['Tables']['auction_bids']['Insert']
type AuctionResultInsert = Database['public']['Tables']['auction_results']['Insert']

export class AuctionRepository extends BaseRepository {
  async findSessionByTournament(tournamentId: string): Promise<AuctionSession | null> {
    const { data, error } = await this.client
      .from('auction_sessions')
      .select(`
        *,
        current_player:players(
          *,
          skill_category:skill_categories(*)
        )
      `)
      .eq('tournament_id', tournamentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data as unknown as AuctionSession | null
  }

  async findSessionById(sessionId: string): Promise<AuctionSession | null> {
    const { data, error } = await this.client
      .from('auction_sessions')
      .select(`
        *,
        current_player:players(
          *,
          skill_category:skill_categories(*)
        )
      `)
      .eq('id', sessionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(error.message)
    }
    return data as unknown as AuctionSession
  }

  async createSession(session: AuctionSessionInsert): Promise<AuctionSession> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('auction_sessions')
      .insert(session)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as AuctionSession
  }

  async updateSession(id: string, updates: AuctionSessionUpdate): Promise<AuctionSession> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('auction_sessions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as AuctionSession
  }

  async findBidsBySession(sessionId: string): Promise<AuctionBid[]> {
    const { data, error } = await this.client
      .from('auction_bids')
      .select(`
        *,
        team:teams(*),
        player:players(*)
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as AuctionBid[]
  }

  async findBidsByPlayer(sessionId: string, playerId: string): Promise<AuctionBid[]> {
    const { data, error } = await this.client
      .from('auction_bids')
      .select(`
        *,
        team:teams(*),
        player:players(*)
      `)
      .eq('session_id', sessionId)
      .eq('player_id', playerId)
      .order('amount', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as AuctionBid[]
  }

  async getHighestBid(sessionId: string, playerId: string): Promise<AuctionBid | null> {
    const { data, error } = await this.client
      .from('auction_bids')
      .select(`
        *,
        team:teams(*),
        player:players(*)
      `)
      .eq('session_id', sessionId)
      .eq('player_id', playerId)
      .order('amount', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data as unknown as AuctionBid | null
  }

  async createBid(bid: AuctionBidInsert): Promise<AuctionBid> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('auction_bids')
      .insert(bid)
      .select(`
        *,
        team:teams(*),
        player:players(*)
      `)
      .single()

    if (error) throw new Error(error.message)
    return data as AuctionBid
  }

  async markAllBidsAsLosing(sessionId: string, playerId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.client as any)
      .from('auction_bids')
      .update({ is_winning: false })
      .eq('session_id', sessionId)
      .eq('player_id', playerId)

    if (error) throw new Error(error.message)
  }

  async markBidAsWinning(bidId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.client as any)
      .from('auction_bids')
      .update({ is_winning: true })
      .eq('id', bidId)

    if (error) throw new Error(error.message)
  }

  async createResult(result: AuctionResultInsert): Promise<AuctionResult> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('auction_results')
      .insert(result)
      .select(`
        *,
        team:teams(*),
        player:players(*)
      `)
      .single()

    if (error) throw new Error(error.message)
    return data as AuctionResult
  }

  async findResultsBySession(sessionId: string): Promise<AuctionResult[]> {
    const { data, error } = await this.client
      .from('auction_results')
      .select(`
        *,
        team:teams(*),
        player:players(*)
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as AuctionResult[]
  }

  async isPlayerAlreadySold(sessionId: string, playerId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('auction_results')
      .select('id')
      .eq('session_id', sessionId)
      .eq('player_id', playerId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data !== null
  }
}
