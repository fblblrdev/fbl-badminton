export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'SUPER_ADMIN' | 'TOURNAMENT_MANAGER' | 'CAPTAIN'
export type TournamentStatus = 'draft' | 'active' | 'completed'
export type AuctionSessionStatus = 'pending' | 'active' | 'paused' | 'completed'
export type Gender = 'male' | 'female'
export type FixtureType = 'round_robin' | 'knockout' | 'manual'
export type FixtureStatus = 'scheduled' | 'completed' | 'cancelled'
export type MatchType = 'singles' | 'doubles' | 'mixed_doubles'
export type MatchStatus = 'pending' | 'in_progress' | 'completed'
export type MatchSide = 'home' | 'away'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: UserRole
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: UserRole
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: UserRole
          created_at?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          venue: string
          start_date: string
          end_date: string
          auction_points: number
          auction_increment: number
          timer_seconds: number
          captain_is_player: boolean
          min_team_size: number
          max_team_size: number
          min_female_players: number
          max_female_players: number
          status: TournamentStatus
          created_by: string
          manager_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          venue: string
          start_date: string
          end_date: string
          auction_points: number
          auction_increment: number
          timer_seconds: number
          captain_is_player?: boolean
          min_team_size: number
          max_team_size: number
          min_female_players: number
          max_female_players: number
          status?: TournamentStatus
          created_by: string
          manager_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          venue?: string
          start_date?: string
          end_date?: string
          auction_points?: number
          auction_increment?: number
          timer_seconds?: number
          captain_is_player?: boolean
          min_team_size?: number
          max_team_size?: number
          min_female_players?: number
          max_female_players?: number
          status?: TournamentStatus
          created_by?: string
          manager_id?: string | null
          created_at?: string
        }
      }
      skill_categories: {
        Row: {
          id: string
          tournament_id: string
          name: string
          base_price: number
          min_players: number
          max_players: number
          is_captain_category: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          name: string
          base_price: number
          min_players: number
          max_players: number
          is_captain_category?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          name?: string
          base_price?: number
          min_players?: number
          max_players?: number
          is_captain_category?: boolean
          created_at?: string
        }
      }
      players: {
        Row: {
          id: string
          tournament_id: string
          name: string
          gender: Gender
          skill_category_id: string | null
          base_price: number
          is_captain: boolean
          phone: string | null
          email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          name: string
          gender: Gender
          skill_category_id?: string | null
          base_price: number
          is_captain?: boolean
          phone?: string | null
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          name?: string
          gender?: Gender
          skill_category_id?: string | null
          base_price?: number
          is_captain?: boolean
          phone?: string | null
          email?: string | null
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          tournament_id: string
          name: string
          captain_id: string
          balance: number
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          name: string
          captain_id: string
          balance: number
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          name?: string
          captain_id?: string
          balance?: number
          created_at?: string
        }
      }
      team_players: {
        Row: {
          id: string
          team_id: string
          player_id: string
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          player_id: string
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          player_id?: string
          created_at?: string
        }
      }
      auction_sessions: {
        Row: {
          id: string
          tournament_id: string
          status: AuctionSessionStatus
          current_player_id: string | null
          skipped_player_ids: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          status?: AuctionSessionStatus
          current_player_id?: string | null
          skipped_player_ids?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          status?: AuctionSessionStatus
          current_player_id?: string | null
          skipped_player_ids?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      auction_bids: {
        Row: {
          id: string
          session_id: string
          player_id: string
          team_id: string
          amount: number
          is_winning: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          player_id: string
          team_id: string
          amount: number
          is_winning?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          player_id?: string
          team_id?: string
          amount?: number
          is_winning?: boolean
          created_at?: string
        }
      }
      auction_results: {
        Row: {
          id: string
          session_id: string
          player_id: string
          team_id: string
          final_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          player_id: string
          team_id: string
          final_amount: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          player_id?: string
          team_id?: string
          final_amount?: number
          created_at?: string
        }
      }
      fixtures: {
        Row: {
          id: string
          tournament_id: string
          type: FixtureType
          round: number
          home_team_id: string
          away_team_id: string
          scheduled_at: string | null
          status: FixtureStatus
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          type: FixtureType
          round: number
          home_team_id: string
          away_team_id: string
          scheduled_at?: string | null
          status?: FixtureStatus
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          type?: FixtureType
          round?: number
          home_team_id?: string
          away_team_id?: string
          scheduled_at?: string | null
          status?: FixtureStatus
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          fixture_id: string
          type: MatchType
          status: MatchStatus
          created_at: string
        }
        Insert: {
          id?: string
          fixture_id: string
          type: MatchType
          status?: MatchStatus
          created_at?: string
        }
        Update: {
          id?: string
          fixture_id?: string
          type?: MatchType
          status?: MatchStatus
          created_at?: string
        }
      }
      match_players: {
        Row: {
          id: string
          match_id: string
          player_id: string
          team_id: string
          side: MatchSide
        }
        Insert: {
          id?: string
          match_id: string
          player_id: string
          team_id: string
          side: MatchSide
        }
        Update: {
          id?: string
          match_id?: string
          player_id?: string
          team_id?: string
          side?: MatchSide
        }
      }
      match_scores: {
        Row: {
          id: string
          match_id: string
          home_score: number
          away_score: number
          winner_team_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          home_score: number
          away_score: number
          winner_team_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          home_score?: number
          away_score?: number
          winner_team_id?: string | null
          created_at?: string
        }
      }
      player_rankings: {
        Row: {
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
        Insert: {
          id?: string
          player_id: string
          tournament_id: string
          elo_rating?: number
          wins?: number
          losses?: number
          total_matches?: number
          win_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          tournament_id?: string
          elo_rating?: number
          wins?: number
          losses?: number
          total_matches?: number
          win_percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      tournament_status: TournamentStatus
      auction_session_status: AuctionSessionStatus
      gender: Gender
      fixture_type: FixtureType
      fixture_status: FixtureStatus
      match_type: MatchType
      match_status: MatchStatus
      match_side: MatchSide
    }
  }
}
