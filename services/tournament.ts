import { TournamentRepository } from '@/repositories/tournament'
import type { Tournament, SkillCategory } from '@/types'
import type { TournamentFormValues } from '@/lib/validations/tournament'
import type { DbClient } from '@/repositories/base'

export class TournamentService {
  private repo: TournamentRepository

  constructor(client: DbClient) {
    this.repo = new TournamentRepository(client)
  }

  async getAllTournaments(): Promise<Tournament[]> {
    return this.repo.findAll()
  }

  async getTournamentById(id: string): Promise<Tournament | null> {
    return this.repo.findById(id)
  }

  async getTournamentsByCreator(userId: string): Promise<Tournament[]> {
    return this.repo.findByCreator(userId)
  }

  async getTournamentsByManager(managerId: string): Promise<Tournament[]> {
    return this.repo.findByManager(managerId)
  }

  async createTournament(
    data: TournamentFormValues,
    userId: string,
    managerId?: string
  ): Promise<{ tournament: Tournament; categories: SkillCategory[] }> {
    const { skill_categories, ...tournamentData } = data

    const tournament = await this.repo.create({
      ...tournamentData,
      created_by: userId,
      manager_id: managerId ?? null,
      status: 'draft',
    })

    const categories = await this.repo.createSkillCategories(
      skill_categories.map((cat) => ({
        ...cat,
        tournament_id: tournament.id,
      }))
    )

    return { tournament, categories }
  }

  async updateTournament(
    id: string,
    data: Partial<TournamentFormValues>,
    userId: string,
    userRole?: string
  ): Promise<Tournament> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new Error('Tournament not found')
    const isOwner = existing.created_by === userId || (existing as unknown as { manager_id: string | null }).manager_id === userId
    if (userRole !== 'SUPER_ADMIN' && !isOwner) {
      throw new Error('Unauthorized: you are not assigned to this tournament')
    }

    const { skill_categories, ...tournamentData } = data

    const tournament = await this.repo.update(id, tournamentData)

    if (skill_categories) {
      await this.repo.deleteSkillCategories(id)
      await this.repo.createSkillCategories(
        skill_categories.map((cat) => ({
          ...cat,
          tournament_id: id,
        }))
      )
    }

    return tournament
  }

  async deleteTournament(id: string, userId: string, userRole?: string): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new Error('Tournament not found')
    const isOwner = existing.created_by === userId || (existing as unknown as { manager_id: string | null }).manager_id === userId
    if (userRole !== 'SUPER_ADMIN' && !isOwner) {
      throw new Error('Unauthorized')
    }
    await this.repo.delete(id)
  }

  async activateTournament(id: string): Promise<Tournament> {
    return this.repo.update(id, { status: 'active' })
  }

  async completeTournament(id: string): Promise<Tournament> {
    return this.repo.update(id, { status: 'completed' })
  }

  async getSkillCategories(tournamentId: string): Promise<SkillCategory[]> {
    return this.repo.findSkillCategories(tournamentId)
  }
}
