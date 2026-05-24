-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'TOURNAMENT_MANAGER', 'CAPTAIN');
CREATE TYPE tournament_status AS ENUM ('draft', 'active', 'completed');
CREATE TYPE auction_session_status AS ENUM ('pending', 'active', 'paused', 'completed');
CREATE TYPE gender AS ENUM ('male', 'female');
CREATE TYPE fixture_type AS ENUM ('round_robin', 'knockout', 'manual');
CREATE TYPE fixture_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE match_type AS ENUM ('singles', 'doubles', 'mixed_doubles');
CREATE TYPE match_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE match_side AS ENUM ('home', 'away');

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'CAPTAIN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tournaments
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  venue TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  auction_points INTEGER NOT NULL DEFAULT 10000,
  auction_increment INTEGER NOT NULL DEFAULT 100,
  timer_seconds INTEGER NOT NULL DEFAULT 30,
  captain_is_player BOOLEAN NOT NULL DEFAULT TRUE,
  min_team_size INTEGER NOT NULL DEFAULT 5,
  max_team_size INTEGER NOT NULL DEFAULT 10,
  min_female_players INTEGER NOT NULL DEFAULT 0,
  max_female_players INTEGER NOT NULL DEFAULT 10,
  status tournament_status NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES profiles(id),
  manager_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tournaments_dates_check CHECK (end_date >= start_date),
  CONSTRAINT tournaments_team_size_check CHECK (max_team_size >= min_team_size),
  CONSTRAINT tournaments_female_check CHECK (max_female_players >= min_female_players)
);

-- Skill Categories
CREATE TABLE skill_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  base_price INTEGER NOT NULL DEFAULT 0,
  min_players INTEGER NOT NULL DEFAULT 0,
  max_players INTEGER NOT NULL DEFAULT 10,
  is_captain_category BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT skill_categories_max_check CHECK (max_players >= min_players)
);

-- Players (not users, tournament participants)
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  gender gender NOT NULL,
  skill_category_id UUID REFERENCES skill_categories(id) ON DELETE SET NULL,
  base_price INTEGER NOT NULL DEFAULT 0,
  is_captain BOOLEAN NOT NULL DEFAULT FALSE,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  captain_id UUID NOT NULL REFERENCES players(id),
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT teams_balance_non_negative CHECK (balance >= 0)
);

-- Team Players (junction table)
CREATE TABLE team_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, player_id),
  UNIQUE(player_id) -- player can only be on one team
);

-- Auction Sessions
CREATE TABLE auction_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  status auction_session_status NOT NULL DEFAULT 'pending',
  current_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auction Bids (append-only, never deleted or updated)
CREATE TABLE auction_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES auction_sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id),
  team_id UUID NOT NULL REFERENCES teams(id),
  amount INTEGER NOT NULL,
  is_winning BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT auction_bids_amount_positive CHECK (amount > 0)
);

-- Auction Results (confirmed sales)
CREATE TABLE auction_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES auction_sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id),
  team_id UUID NOT NULL REFERENCES teams(id),
  final_amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, player_id) -- player can only be sold once per session
);

-- Fixtures
CREATE TABLE fixtures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  type fixture_type NOT NULL,
  round INTEGER NOT NULL DEFAULT 1,
  home_team_id UUID NOT NULL REFERENCES teams(id),
  away_team_id UUID NOT NULL REFERENCES teams(id),
  scheduled_at TIMESTAMPTZ,
  status fixture_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fixtures_different_teams CHECK (home_team_id != away_team_id)
);

-- Matches
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  type match_type NOT NULL,
  status match_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Match Players
CREATE TABLE match_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id),
  team_id UUID NOT NULL REFERENCES teams(id),
  side match_side NOT NULL,
  UNIQUE(match_id, player_id)
);

-- Match Scores
CREATE TABLE match_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE UNIQUE,
  home_score INTEGER NOT NULL DEFAULT 0,
  away_score INTEGER NOT NULL DEFAULT 0,
  winner_team_id UUID REFERENCES teams(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT match_scores_non_negative CHECK (home_score >= 0 AND away_score >= 0)
);

-- Player Rankings
CREATE TABLE player_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  elo_rating NUMERIC NOT NULL DEFAULT 1200,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  total_matches INTEGER NOT NULL DEFAULT 0,
  win_percentage NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(player_id, tournament_id)
);

-- Indexes for performance
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_created_by ON tournaments(created_by);
CREATE INDEX idx_players_tournament ON players(tournament_id);
CREATE INDEX idx_players_captain ON players(tournament_id, is_captain);
CREATE INDEX idx_teams_tournament ON teams(tournament_id);
CREATE INDEX idx_team_players_team ON team_players(team_id);
CREATE INDEX idx_team_players_player ON team_players(player_id);
CREATE INDEX idx_auction_sessions_tournament ON auction_sessions(tournament_id);
CREATE INDEX idx_auction_bids_session ON auction_bids(session_id);
CREATE INDEX idx_auction_bids_player ON auction_bids(session_id, player_id);
CREATE INDEX idx_auction_results_session ON auction_results(session_id);
CREATE INDEX idx_fixtures_tournament ON fixtures(tournament_id);
CREATE INDEX idx_matches_fixture ON matches(fixture_id);
CREATE INDEX idx_match_players_match ON match_players(match_id);
CREATE INDEX idx_player_rankings_tournament ON player_rankings(tournament_id);
CREATE INDEX idx_player_rankings_elo ON player_rankings(elo_rating DESC);

-- Trigger to auto-create profile on user signup
-- Safe version: no enum casting, always defaults to CAPTAIN
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _role user_role;
BEGIN
  BEGIN
    _role := (NEW.raw_user_meta_data->>'role')::user_role;
  EXCEPTION WHEN invalid_text_representation THEN
    _role := 'CAPTAIN';
  END;
  IF _role IS NULL THEN
    _role := 'CAPTAIN';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    _role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger to update updated_at on auction_sessions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_auction_sessions_updated_at
  BEFORE UPDATE ON auction_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_rankings_updated_at
  BEFORE UPDATE ON player_rankings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for auction tables
ALTER PUBLICATION supabase_realtime ADD TABLE auction_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE auction_bids;
ALTER PUBLICATION supabase_realtime ADD TABLE auction_results;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE match_scores;

-- =============================================================
-- Table-level GRANTs
-- These must be run after every DROP SCHEMA CASCADE + recreate.
-- The service_role key bypasses RLS but still needs table grants.
-- =============================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon, service_role;
