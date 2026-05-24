import { BaseRepository } from './base'
import type { Fixture } from '@/types'
import type { Database } from '@/types/database'

type FixtureInsert = Database['public']['Tables']['fixtures']['Insert']
type FixtureUpdate = Database['public']['Tables']['fixtures']['Update']

export class FixtureRepository extends BaseRepository {
  async findByTournament(tournamentId: string): Promise<Fixture[]> {
    const { data, error } = await this.client
      .from('fixtures')
      .select(`
        *,
        home_team:teams!fixtures_home_team_id_fkey(*),
        away_team:teams!fixtures_away_team_id_fkey(*),
        matches(*)
      `)
      .eq('tournament_id', tournamentId)
      .order('round', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as Fixture[]
  }

  async findById(id: string): Promise<Fixture | null> {
    const { data, error } = await this.client
      .from('fixtures')
      .select(`
        *,
        home_team:teams!fixtures_home_team_id_fkey(*),
        away_team:teams!fixtures_away_team_id_fkey(*),
        matches(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(error.message)
    }
    return data as unknown as Fixture
  }

  async create(fixture: FixtureInsert): Promise<Fixture> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('fixtures')
      .insert(fixture)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Fixture
  }

  async createMany(fixtures: FixtureInsert[]): Promise<Fixture[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('fixtures')
      .insert(fixtures)
      .select()

    if (error) throw new Error(error.message)
    return (data ?? []) as Fixture[]
  }

  async update(id: string, updates: FixtureUpdate): Promise<Fixture> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from('fixtures')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Fixture
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('fixtures')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }

  async deleteByTournament(tournamentId: string): Promise<void> {
    const { error } = await this.client
      .from('fixtures')
      .delete()
      .eq('tournament_id', tournamentId)

    if (error) throw new Error(error.message)
  }
}
