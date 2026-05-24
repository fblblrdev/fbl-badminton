import { PlayerRepository } from '@/repositories/player'
import { TournamentRepository } from '@/repositories/tournament'
import type { Player, CSVPlayer } from '@/types'
import type { PlayerFormValues } from '@/lib/validations/player'
import type { DbClient } from '@/repositories/base'
import type { Gender } from '@/types/database'

export class PlayerService {
  private playerRepo: PlayerRepository
  private tournamentRepo: TournamentRepository

  constructor(client: DbClient) {
    this.playerRepo = new PlayerRepository(client)
    this.tournamentRepo = new TournamentRepository(client)
  }

  async getPlayersByTournament(tournamentId: string): Promise<Player[]> {
    return this.playerRepo.findByTournament(tournamentId)
  }

  async getPlayerById(id: string): Promise<Player | null> {
    return this.playerRepo.findById(id)
  }

  async getUnassignedPlayers(tournamentId: string): Promise<Player[]> {
    return this.playerRepo.findUnassigned(tournamentId)
  }

  async createPlayer(tournamentId: string, data: PlayerFormValues): Promise<Player> {
    const tournament = await this.tournamentRepo.findById(tournamentId)
    if (!tournament) throw new Error('Tournament not found')

    return this.playerRepo.create({
      tournament_id: tournamentId,
      name: data.name,
      gender: data.gender,
      skill_category_id: data.skill_category_id || null,
      base_price: data.base_price,
      is_captain: data.is_captain,
      phone: data.phone || null,
      email: data.email || null,
    })
  }

  async updatePlayer(id: string, data: Partial<PlayerFormValues>): Promise<Player> {
    const existing = await this.playerRepo.findById(id)
    if (!existing) throw new Error('Player not found')

    return this.playerRepo.update(id, {
      name: data.name,
      gender: data.gender,
      skill_category_id: data.skill_category_id ?? existing.skill_category_id,
      base_price: data.base_price,
      is_captain: data.is_captain,
      phone: data.phone ?? existing.phone,
      email: data.email ?? existing.email,
    })
  }

  async deletePlayer(id: string): Promise<void> {
    return this.playerRepo.delete(id)
  }

  async bulkCreateFromCSV(tournamentId: string, csvPlayers: CSVPlayer[]): Promise<Player[]> {
    const tournament = await this.tournamentRepo.findById(tournamentId)
    if (!tournament) throw new Error('Tournament not found')

    const categories = await this.tournamentRepo.findSkillCategories(tournamentId)
    const categoryMap = new Map(categories.map((c) => [c.name.toLowerCase(), c]))

    const playersToCreate = csvPlayers.map((csvPlayer) => {
      const category = categoryMap.get(csvPlayer.skill_category.toLowerCase())

      const gender = csvPlayer.gender.toLowerCase() as Gender
      if (gender !== 'male' && gender !== 'female') {
        throw new Error(`Invalid gender "${csvPlayer.gender}" for player "${csvPlayer.name}"`)
      }

      return {
        tournament_id: tournamentId,
        name: csvPlayer.name.trim(),
        gender,
        skill_category_id: category?.id ?? null,
        base_price: category?.base_price ?? 0,
        is_captain: false,
        phone: null,
        email: null,
      }
    })

    return this.playerRepo.createMany(playersToCreate)
  }
}
