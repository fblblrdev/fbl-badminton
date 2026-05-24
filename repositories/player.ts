import { BaseRepository } from './base'
import type { Player } from '@/types'
import type { Database } from '@/types/database'

type PlayerInsert = Database['public']['Tables']['players']['Insert']
type PlayerUpdate = Database['public']['Tables']['players']['Update']

export class PlayerRepository extends BaseRepository {
  async findByTournament(tournamentId: string): Promise<Player[]> {
    const { data, error } = await this.client
      .from('players')
      .select(`
        *,
        skill_category:skill_categories(*)
      `)
      .eq('tournament_id', tournamentId)
      .order('name', { ascending: true })

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as Player[]
  }

  async findById(id: string): Promise<Player | null> {
    const { data, error } = await this.client
      .from('players')
      .select(`
        *,
        skill_category:skill_categories(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(error.message)
    }
    return data as unknown as Player
  }

  async findCaptains(tournamentId: string): Promise<Player[]> {
    const { data, error } = await this.client
      .from('players')
      .select(`
        *,
        skill_category:skill_categories(*)
      `)
      .eq('tournament_id', tournamentId)
      .eq('is_captain', true)

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as Player[]
  }

  async findUnassigned(tournamentId: string): Promise<Player[]> {
    const assignedPlayerIds = await this.getAssignedPlayerIds(tournamentId)

    const query = this.client
      .from('players')
      .select(`
        *,
        skill_category:skill_categories(*)
      `)
      .eq('tournament_id', tournamentId)
      .eq('is_captain', false)
      .order('name', { ascending: true })

    if (assignedPlayerIds.length > 0) {
      query.not('id', 'in', `(${assignedPlayerIds.join(',')})`)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as Player[]
  }

  private async getAssignedPlayerIds(tournamentId: string): Promise<string[]> {
    const { data, error } = await this.client
      .from('team_players')
      .select('player_id, teams!inner(tournament_id)')
      .eq('teams.tournament_id', tournamentId)

    if (error) return []
    return ((data ?? []) as unknown as Array<{ player_id: string }>).map((row) => row.player_id)
  }

  async create(player: PlayerInsert): Promise<Player> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('players')
      .insert(player)
      .select(`
        *,
        skill_category:skill_categories(*)
      `)
      .single()

    if (error) throw new Error(error.message)
    return data as Player
  }

  async createMany(players: PlayerInsert[]): Promise<Player[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('players')
      .insert(players)
      .select(`
        *,
        skill_category:skill_categories(*)
      `)

    if (error) throw new Error(error.message)
    return (data ?? []) as Player[]
  }

  async update(id: string, updates: PlayerUpdate): Promise<Player> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('players')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        skill_category:skill_categories(*)
      `)
      .single()

    if (error) throw new Error(error.message)
    return data as Player
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('players')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }

  async countByTournament(tournamentId: string): Promise<number> {
    const { count, error } = await this.client
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', tournamentId)

    if (error) throw new Error(error.message)
    return count ?? 0
  }
}
