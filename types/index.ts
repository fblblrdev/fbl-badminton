import type {
  UserRole,
  TournamentStatus,
  AuctionSessionStatus,
  Gender,
  FixtureType,
  FixtureStatus,
  MatchType,
  MatchStatus,
  MatchSide,
} from './database'

export type {
  UserRole,
  TournamentStatus,
  AuctionSessionStatus,
  Gender,
  FixtureType,
  FixtureStatus,
  MatchType,
  MatchStatus,
  MatchSide,
}

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
}

export interface Tournament {
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

export interface SkillCategory {
  id: string
  tournament_id: string
  name: string
  base_price: number
  min_players: number
  max_players: number
  created_at: string
}

export interface Player {
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
  skill_category?: SkillCategory
}

export interface Team {
  id: string
  tournament_id: string
  name: string
  captain_id: string
  balance: number
  created_at: string
  captain?: Player
  players?: Player[]
}

export interface TeamPlayer {
  id: string
  team_id: string
  player_id: string
  created_at: string
}

export interface AuctionSession {
  id: string
  tournament_id: string
  status: AuctionSessionStatus
  current_player_id: string | null
  created_at: string
  updated_at: string
  current_player?: Player
}

export interface AuctionBid {
  id: string
  session_id: string
  player_id: string
  team_id: string
  amount: number
  is_winning: boolean
  created_at: string
  team?: Team
  player?: Player
}

export interface AuctionResult {
  id: string
  session_id: string
  player_id: string
  team_id: string
  final_amount: number
  created_at: string
  team?: Team
  player?: Player
}

export interface Fixture {
  id: string
  tournament_id: string
  type: FixtureType
  round: number
  home_team_id: string
  away_team_id: string
  scheduled_at: string | null
  status: FixtureStatus
  created_at: string
  home_team?: Team
  away_team?: Team
  matches?: Match[]
}

export interface Match {
  id: string
  fixture_id: string
  type: MatchType
  status: MatchStatus
  created_at: string
  fixture?: Fixture
  players?: MatchPlayer[]
  scores?: MatchScore[]
}

export interface MatchPlayer {
  id: string
  match_id: string
  player_id: string
  team_id: string
  side: MatchSide
  player?: Player
  team?: Team
}

export interface MatchScore {
  id: string
  match_id: string
  home_score: number
  away_score: number
  winner_team_id: string | null
  created_at: string
  winner_team?: Team
}

export interface PlayerRanking {
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
  player?: Player
}

export interface AuctionState {
  session: AuctionSession | null
  currentPlayer: Player | null
  currentBid: AuctionBid | null
  bids: AuctionBid[]
  teams: TeamWithBalance[]
  results: AuctionResult[]
}

export interface TeamWithBalance extends Team {
  player_count: number
  female_count: number
  players_by_category: Record<string, number>
}

export interface CSVPlayer {
  name: string
  gender: string
  skill_category: string
  base_price: string
  is_captain: string
  phone: string
  email: string
}

export interface AuthUser {
  id: string
  email: string
  profile: Profile | null
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}

export interface TournamentFormValues {
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
  skill_categories: {
    name: string
    base_price: number
    min_players: number
    max_players: number
  }[]
}

export interface PlayerFormValues {
  name: string
  gender: Gender
  skill_category_id: string
  base_price: number
  is_captain: boolean
  phone: string
  email: string
}

export interface ScoreUpdatePayload {
  match_id: string
  home_score: number
  away_score: number
  winner_team_id: string | null
}

export interface RealtimeAuctionPayload {
  type: 'BID' | 'CONFIRM' | 'NEXT' | 'START' | 'PAUSE' | 'RESUME'
  session_id: string
  data: Record<string, unknown>
}
