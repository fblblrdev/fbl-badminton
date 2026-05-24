import type { UserRole, TournamentStatus, AuctionSessionStatus, MatchType, FixtureType, Gender } from '@/types'

export const ROLES: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  TOURNAMENT_MANAGER: 'Tournament Manager',
  CAPTAIN: 'Captain',
}

export const TOURNAMENT_STATUS: Record<TournamentStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
}

export const AUCTION_STATUS: Record<AuctionSessionStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
}

export const MATCH_TYPES: Record<MatchType, string> = {
  singles: 'Singles',
  doubles: 'Doubles',
  mixed_doubles: 'Mixed Doubles',
}

export const FIXTURE_TYPES: Record<FixtureType, string> = {
  round_robin: 'Round Robin',
  knockout: 'Knockout',
  manual: 'Manual',
}

export const GENDER_OPTIONS: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
}

export const DEFAULT_SKILL_CATEGORIES = [
  'Advanced',
  'Intermediate+',
  'Intermediate',
  'Beginner',
]

export const DEFAULT_TIMER_SECONDS = 30
export const DEFAULT_AUCTION_INCREMENT = 100
export const DEFAULT_AUCTION_POINTS = 10000
export const DEFAULT_ELO_RATING = 1200

export const APP_NAME = 'FBL Badminton'
export const APP_DESCRIPTION = 'Professional Badminton Tournament Auction Platform'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ADMIN: '/admin',
  ADMIN_TOURNAMENTS: '/admin/tournaments',
  ADMIN_NEW_TOURNAMENT: '/admin/tournaments/new',
  MANAGER: '/manager',
  CAPTAIN: '/captain',
  AUCTION: '/auction',
  FIXTURES: '/fixtures',
  MATCHES: '/matches',
  RANKINGS: '/rankings',
} as const

export const API_ROUTES = {
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  TOURNAMENTS: '/api/tournaments',
  AUCTION_START: '/api/auction/start',
  AUCTION_BID: '/api/auction/bid',
  AUCTION_CONFIRM: '/api/auction/confirm',
  AUCTION_STATE: '/api/auction/state',
  AUCTION_NEXT: '/api/auction/next',
  FIXTURES_GENERATE: '/api/fixtures/generate',
  RANKINGS: '/api/rankings',
} as const

export const QUERY_KEYS = {
  TOURNAMENTS: 'tournaments',
  TOURNAMENT: 'tournament',
  PLAYERS: 'players',
  PLAYER: 'player',
  TEAMS: 'teams',
  TEAM: 'team',
  AUCTION_STATE: 'auction-state',
  AUCTION_BIDS: 'auction-bids',
  FIXTURES: 'fixtures',
  MATCHES: 'matches',
  MATCH: 'match',
  RANKINGS: 'rankings',
  PROFILE: 'profile',
} as const
