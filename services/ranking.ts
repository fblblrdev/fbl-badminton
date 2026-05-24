import type { DbClient } from '@/repositories/base'
import type { PlayerRanking } from '@/types'
import { calculateElo } from '@/utils/elo'
import { DEFAULT_ELO_RATING } from '@/lib/constants'

type RankingRow = {
  id: string
  player_id: string
  tournament_id: string
  elo_rating: number
  wins: number
  losses: number
  total_matches: number
  win_percentage: number
  created_at: string
  updated_at: string
}

export class RankingService {
  private client: DbClient

  constructor(client: DbClient) {
    this.client = client
  }

  async getRankings(tournamentId: string): Promise<PlayerRanking[]> {
    const { data, error } = await this.client
      .from('player_rankings')
      .select(`
        *,
        player:players(
          *,
          skill_category:skill_categories(*)
        )
      `)
      .eq('tournament_id', tournamentId)
      .order('elo_rating', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as PlayerRanking[]
  }

  async getGlobalRankings(): Promise<PlayerRanking[]> {
    const { data, error } = await this.client
      .from('player_rankings')
      .select(`
        *,
        player:players(
          *,
          skill_category:skill_categories(*)
        )
      `)
      .order('elo_rating', { ascending: false })
      .limit(100)

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as PlayerRanking[]
  }

  async updateRankingsAfterMatch(
    matchId: string,
    winnerTeamId: string
  ): Promise<void> {
    const { data: matchPlayers, error: mpError } = await this.client
      .from('match_players')
      .select(`
        *,
        player:players(*),
        team:teams(*),
        match:matches(fixture_id, fixture:fixtures(tournament_id))
      `)
      .eq('match_id', matchId)

    if (mpError) throw new Error(mpError.message)
    if (!matchPlayers || matchPlayers.length === 0) return

    type MatchPlayerRow = {
      player_id: string
      side: string
      team_id: string
      match: { fixture: { tournament_id: string } }
    }

    const players = matchPlayers as unknown as MatchPlayerRow[]

    const firstPlayer = players[0]
    const tournamentId = firstPlayer.match?.fixture?.tournament_id
    if (!tournamentId) return

    const homePlayers = players.filter((mp) => mp.side === 'home')
    const awayPlayers = players.filter((mp) => mp.side === 'away')

    const homeTeamId = homePlayers[0]?.team_id
    const isHomeWinner = homeTeamId === winnerTeamId

    for (const mp of players) {
      const isWinner = mp.team_id === winnerTeamId

      const { data: rankingData } = await this.client
        .from('player_rankings')
        .select('*')
        .eq('player_id', mp.player_id)
        .eq('tournament_id', tournamentId)
        .maybeSingle()

      const existingRanking = rankingData as unknown as RankingRow | null

      const opponents = isWinner
        ? (isHomeWinner ? awayPlayers : homePlayers)
        : (isHomeWinner ? homePlayers : awayPlayers)

      const opponentRatings = await Promise.all(
        opponents.map(async (opp) => {
          const { data: oppData } = await this.client
            .from('player_rankings')
            .select('elo_rating')
            .eq('player_id', opp.player_id)
            .eq('tournament_id', tournamentId)
            .maybeSingle()
          const oppRanking = oppData as unknown as { elo_rating: number } | null
          return oppRanking?.elo_rating ?? DEFAULT_ELO_RATING
        })
      )

      const avgOpponentRating =
        opponentRatings.length > 0
          ? opponentRatings.reduce((a: number, b: number) => a + b, 0) / opponentRatings.length
          : DEFAULT_ELO_RATING

      const currentRating = existingRanking?.elo_rating ?? DEFAULT_ELO_RATING
      const newRating = calculateElo(currentRating, avgOpponentRating, isWinner ? 1 : 0)

      if (existingRanking) {
        const newWins = existingRanking.wins + (isWinner ? 1 : 0)
        const newLosses = existingRanking.losses + (isWinner ? 0 : 1)
        const newTotal = existingRanking.total_matches + 1

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (this.client as any)
          .from('player_rankings')
          .update({
            elo_rating: newRating,
            wins: newWins,
            losses: newLosses,
            total_matches: newTotal,
            win_percentage: newTotal > 0 ? (newWins / newTotal) * 100 : 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingRanking.id)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (this.client as any).from('player_rankings').insert({
          player_id: mp.player_id,
          tournament_id: tournamentId,
          elo_rating: newRating,
          wins: isWinner ? 1 : 0,
          losses: isWinner ? 0 : 1,
          total_matches: 1,
          win_percentage: isWinner ? 100 : 0,
        })
      }
    }
  }
}
