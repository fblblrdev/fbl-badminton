import { FixtureRepository } from '@/repositories/fixture'
import { TeamRepository } from '@/repositories/team'
import type { Fixture } from '@/types'
import type { FixtureType } from '@/types/database'
import type { DbClient } from '@/repositories/base'

export class FixtureService {
  private fixtureRepo: FixtureRepository
  private teamRepo: TeamRepository

  constructor(client: DbClient) {
    this.fixtureRepo = new FixtureRepository(client)
    this.teamRepo = new TeamRepository(client)
  }

  async getFixturesByTournament(tournamentId: string): Promise<Fixture[]> {
    return this.fixtureRepo.findByTournament(tournamentId)
  }

  async getFixtureById(id: string): Promise<Fixture | null> {
    return this.fixtureRepo.findById(id)
  }

  async generateRoundRobin(tournamentId: string): Promise<Fixture[]> {
    const teams = await this.teamRepo.findByTournament(tournamentId)

    if (teams.length < 2) {
      throw new Error('At least 2 teams are required to generate fixtures')
    }

    await this.fixtureRepo.deleteByTournament(tournamentId)

    const fixtures: Parameters<typeof this.fixtureRepo.createMany>[0] = []
    let round = 1

    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        fixtures.push({
          tournament_id: tournamentId,
          type: 'round_robin',
          round,
          home_team_id: teams[i].id,
          away_team_id: teams[j].id,
          status: 'scheduled',
        })
        round++
      }
    }

    return this.fixtureRepo.createMany(fixtures)
  }

  async generateKnockout(tournamentId: string): Promise<Fixture[]> {
    const teams = await this.teamRepo.findByTournament(tournamentId)

    if (teams.length < 2) {
      throw new Error('At least 2 teams are required to generate fixtures')
    }

    await this.fixtureRepo.deleteByTournament(tournamentId)

    const shuffled = [...teams].sort(() => Math.random() - 0.5)
    const fixtures: Parameters<typeof this.fixtureRepo.createMany>[0] = []
    let round = 1

    for (let i = 0; i < shuffled.length - 1; i += 2) {
      fixtures.push({
        tournament_id: tournamentId,
        type: 'knockout',
        round,
        home_team_id: shuffled[i].id,
        away_team_id: shuffled[i + 1].id,
        status: 'scheduled',
      })
      round++
    }

    return this.fixtureRepo.createMany(fixtures)
  }

  async generateFixtures(tournamentId: string, type: FixtureType): Promise<Fixture[]> {
    switch (type) {
      case 'round_robin':
        return this.generateRoundRobin(tournamentId)
      case 'knockout':
        return this.generateKnockout(tournamentId)
      case 'manual':
        return []
      default:
        throw new Error('Invalid fixture type')
    }
  }

  async createManualFixture(
    tournamentId: string,
    homeTeamId: string,
    awayTeamId: string,
    round: number,
    scheduledAt?: string
  ): Promise<Fixture> {
    return this.fixtureRepo.create({
      tournament_id: tournamentId,
      type: 'manual',
      round,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      scheduled_at: scheduledAt ?? null,
      status: 'scheduled',
    })
  }

  async updateFixtureStatus(
    id: string,
    status: 'scheduled' | 'completed' | 'cancelled'
  ): Promise<Fixture> {
    return this.fixtureRepo.update(id, { status })
  }
}
