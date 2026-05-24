import { BaseRepository } from './base'
import type { Tournament, SkillCategory } from '@/types'
import type { Database } from '@/types/database'

type TournamentInsert = Database['public']['Tables']['tournaments']['Insert']
type TournamentUpdate = Database['public']['Tables']['tournaments']['Update']
type SkillCategoryInsert = Database['public']['Tables']['skill_categories']['Insert']

export class TournamentRepository extends BaseRepository {
  async findAll(): Promise<Tournament[]> {
    const { data, error } = await this.client
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as Tournament[]
  }

  async findById(id: string): Promise<Tournament | null> {
    const { data, error } = await this.client
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(error.message)
    }
    return data as unknown as Tournament
  }

  async findByCreator(userId: string): Promise<Tournament[]> {
    const { data, error } = await this.client
      .from('tournaments')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as Tournament[]
  }

  async findByManager(managerId: string): Promise<Tournament[]> {
    // Return tournaments assigned to this manager OR created by them
    const { data, error } = await this.client
      .from('tournaments')
      .select('*')
      .or(`manager_id.eq.${managerId},created_by.eq.${managerId}`)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as Tournament[]
  }

  async create(tournament: TournamentInsert): Promise<Tournament> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('tournaments')
      .insert(tournament)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Tournament
  }

  async update(id: string, updates: TournamentUpdate): Promise<Tournament> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('tournaments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Tournament
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('tournaments')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }

  async findSkillCategories(tournamentId: string): Promise<SkillCategory[]> {
    const { data, error } = await this.client
      .from('skill_categories')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as SkillCategory[]
  }

  async createSkillCategory(category: SkillCategoryInsert): Promise<SkillCategory> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('skill_categories')
      .insert(category)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as SkillCategory
  }

  async createSkillCategories(categories: SkillCategoryInsert[]): Promise<SkillCategory[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('skill_categories')
      .insert(categories)
      .select()

    if (error) throw new Error(error.message)
    return (data ?? []) as SkillCategory[]
  }

  async deleteSkillCategories(tournamentId: string): Promise<void> {
    const { error } = await this.client
      .from('skill_categories')
      .delete()
      .eq('tournament_id', tournamentId)

    if (error) throw new Error(error.message)
  }
}
