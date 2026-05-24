import { BaseRepository } from './base'
import type { Match, MatchPlayer, MatchScore } from '@/types'
import type { Database } from '@/types/database'

type MatchInsert = Database['public']['Tables']['matches']['Insert']
type MatchUpdate = Database['public']['Tables']['matches']['Update']
type MatchPlayerInsert = Database['public']['Tables']['match_players']['Insert']
type MatchScoreInsert = Database['public']['Tables']['match_scores']['Insert']
type MatchScoreUpdate = Database['public']['Tables']['match_scores']['Update']

export class MatchRepository extends BaseRepository {
  async findByFixture(fixtureId: string): Promise<Match[]> {
    const { data, error } = await this.client
      .from('matches')
      .select(`
        *,
        match_players(
          *,
          player:players(*),
          team:teams(*)
        ),
        match_scores(
          *,
          winner_team:teams(*)
        )
      `)
      .eq('fixture_id', fixtureId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as Match[]
  }

  async findById(id: string): Promise<Match | null> {
    const { data, error } = await this.client
      .from('matches')
      .select(`
        *,
        fixture:fixtures(
          *,
          home_team:teams!fixtures_home_team_id_fkey(*),
          away_team:teams!fixtures_away_team_id_fkey(*)
        ),
        match_players(
          *,
          player:players(*),
          team:teams(*)
        ),
        match_scores(
          *,
          winner_team:teams(*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(error.message)
    }
    return data as unknown as Match
  }

  async create(match: MatchInsert): Promise<Match> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('matches')
      .insert(match)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Match
  }

  async update(id: string, updates: MatchUpdate): Promise<Match> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('matches')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Match
  }

  async addPlayers(players: MatchPlayerInsert[]): Promise<MatchPlayer[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('match_players')
      .insert(players)
      .select()

    if (error) throw new Error(error.message)
    return (data ?? []) as MatchPlayer[]
  }

  async upsertScore(score: MatchScoreInsert): Promise<MatchScore> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('match_scores')
      .upsert(score, { onConflict: 'match_id' })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as MatchScore
  }

  async updateScore(matchId: string, updates: MatchScoreUpdate): Promise<MatchScore> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('match_scores')
      .update(updates)
      .eq('match_id', matchId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as MatchScore
  }

  async findPlayerMatches(playerId: string): Promise<Match[]> {
    const { data, error } = await this.client
      .from('match_players')
      .select(`
        match:matches(
          *,
          fixture:fixtures(*),
          match_scores(*),
          match_players(*, player:players(*), team:teams(*))
        )
      `)
      .eq('player_id', playerId)

    if (error) throw new Error(error.message)
    return ((data ?? []) as unknown as Array<{ match: Match }>).map((row) => row.match)
  }
}
