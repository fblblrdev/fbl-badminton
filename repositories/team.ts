import { BaseRepository } from './base'
import type { Team, Player } from '@/types'
import type { Database } from '@/types/database'

type TeamInsert = Database['public']['Tables']['teams']['Insert']
type TeamUpdate = Database['public']['Tables']['teams']['Update']
type TeamPlayerInsert = Database['public']['Tables']['team_players']['Insert']

export class TeamRepository extends BaseRepository {
  async findByTournament(tournamentId: string): Promise<Team[]> {
    const { data, error } = await this.client
      .from('teams')
      .select(`
        *,
        captain:players!teams_captain_id_fkey(
          *,
          skill_category:skill_categories(*)
        ),
        team_players(
          player:players(
            *,
            skill_category:skill_categories(*)
          )
        )
      `)
      .eq('tournament_id', tournamentId)
      .order('name', { ascending: true })

    if (error) throw new Error(error.message)

    return ((data ?? []) as unknown as Array<{
      team_players: Array<{ player: Player }>
    } & Record<string, unknown>>).map((team) => ({
      ...team,
      players: (team.team_players ?? []).map(
        (tp: { player: Player }) => tp.player
      ),
    })) as unknown as Team[]
  }

  async findById(id: string): Promise<Team | null> {
    const { data, error } = await this.client
      .from('teams')
      .select(`
        *,
        captain:players!teams_captain_id_fkey(
          *,
          skill_category:skill_categories(*)
        ),
        team_players(
          player:players(
            *,
            skill_category:skill_categories(*)
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(error.message)
    }

    const row = data as unknown as {
      team_players: Array<{ player: Player }>
    } & Record<string, unknown>

    return {
      ...row,
      players: (row.team_players ?? []).map(
        (tp: { player: Player }) => tp.player
      ),
    } as unknown as Team
  }

  async findByCaptain(captainId: string): Promise<Team | null> {
    const { data, error } = await this.client
      .from('teams')
      .select(`
        *,
        captain:players!teams_captain_id_fkey(*),
        team_players(player:players(*))
      `)
      .eq('captain_id', captainId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(error.message)
    }

    const row = data as unknown as {
      team_players: Array<{ player: Player }>
    } & Record<string, unknown>

    return {
      ...row,
      players: (row.team_players ?? []).map(
        (tp: { player: Player }) => tp.player
      ),
    } as unknown as Team
  }

  async create(team: TeamInsert): Promise<Team> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('teams')
      .insert(team)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Team
  }

  async update(id: string, updates: TeamUpdate): Promise<Team> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('teams')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Team
  }

  async addPlayer(teamPlayer: TeamPlayerInsert): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.client as any)
      .from('team_players')
      .insert(teamPlayer)

    if (error) throw new Error(error.message)
  }

  async removePlayer(teamId: string, playerId: string): Promise<void> {
    const { error } = await this.client
      .from('team_players')
      .delete()
      .eq('team_id', teamId)
      .eq('player_id', playerId)

    if (error) throw new Error(error.message)
  }

  async getPlayerCount(teamId: string): Promise<number> {
    const { count, error } = await this.client
      .from('team_players')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)

    if (error) throw new Error(error.message)
    return count ?? 0
  }

  async deductBalance(teamId: string, amount: number): Promise<void> {
    const { data: teamData, error: fetchError } = await this.client
      .from('teams')
      .select('balance')
      .eq('id', teamId)
      .single()

    if (fetchError) throw new Error(fetchError.message)

    const team = teamData as unknown as { balance: number }
    const newBalance = (team.balance ?? 0) - amount

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.client as any)
      .from('teams')
      .update({ balance: newBalance })
      .eq('id', teamId)

    if (error) throw new Error(error.message)
  }
}
