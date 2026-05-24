import { MatchRepository } from '@/repositories/match'
import { FixtureRepository } from '@/repositories/fixture'
import type { Match, MatchScore } from '@/types'
import type { MatchType, MatchSide } from '@/types/database'
import type { DbClient } from '@/repositories/base'

export class MatchService {
  private matchRepo: MatchRepository
  private fixtureRepo: FixtureRepository

  constructor(client: DbClient) {
    this.matchRepo = new MatchRepository(client)
    this.fixtureRepo = new FixtureRepository(client)
  }

  async getMatchesByFixture(fixtureId: string): Promise<Match[]> {
    return this.matchRepo.findByFixture(fixtureId)
  }

  async getMatchById(id: string): Promise<Match | null> {
    return this.matchRepo.findById(id)
  }

  async createMatch(
    fixtureId: string,
    type: MatchType,
    players: { playerId: string; teamId: string; side: MatchSide }[]
  ): Promise<Match> {
    const fixture = await this.fixtureRepo.findById(fixtureId)
    if (!fixture) throw new Error('Fixture not found')

    const match = await this.matchRepo.create({
      fixture_id: fixtureId,
      type,
      status: 'pending',
    })

    if (players.length > 0) {
      await this.matchRepo.addPlayers(
        players.map((p) => ({
          match_id: match.id,
          player_id: p.playerId,
          team_id: p.teamId,
          side: p.side,
        }))
      )
    }

    const fullMatch = await this.matchRepo.findById(match.id)
    return fullMatch ?? match
  }

  async startMatch(id: string): Promise<Match> {
    const match = await this.matchRepo.findById(id)
    if (!match) throw new Error('Match not found')
    if (match.status !== 'pending') throw new Error('Match is not pending')

    return this.matchRepo.update(id, { status: 'in_progress' })
  }

  async updateScore(
    matchId: string,
    homeScore: number,
    awayScore: number,
    winnerTeamId: string | null
  ): Promise<MatchScore> {
    const match = await this.matchRepo.findById(matchId)
    if (!match) throw new Error('Match not found')

    if (homeScore < 0 || awayScore < 0) {
      throw new Error('Scores cannot be negative')
    }

    const score = await this.matchRepo.upsertScore({
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
      winner_team_id: winnerTeamId,
    })

    if (winnerTeamId) {
      await this.matchRepo.update(matchId, { status: 'completed' })

      const fixture = await this.fixtureRepo.findById(match.fixture_id)
      if (fixture) {
        const allMatches = await this.matchRepo.findByFixture(fixture.id)
        const allCompleted = allMatches.every((m) => m.status === 'completed')
        if (allCompleted) {
          await this.fixtureRepo.update(fixture.id, { status: 'completed' })
        }
      }
    }

    return score
  }

  async getPlayerMatches(playerId: string): Promise<Match[]> {
    return this.matchRepo.findPlayerMatches(playerId)
  }
}
