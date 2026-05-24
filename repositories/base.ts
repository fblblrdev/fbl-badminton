import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export type DbClient = SupabaseClient<Database>

export abstract class BaseRepository {
  protected client: DbClient

  constructor(client: DbClient) {
    this.client = client
  }
}
