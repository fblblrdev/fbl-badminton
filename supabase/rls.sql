-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_rankings ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT role IN ('SUPER_ADMIN', 'TOURNAMENT_MANAGER') FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- PROFILES
-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Super admins can read all profiles
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (public.user_role() = 'SUPER_ADMIN');

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Super admins can update any profile
CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (public.user_role() = 'SUPER_ADMIN');

-- TOURNAMENTS
-- Everyone authenticated can view tournaments
CREATE POLICY "tournaments_select_all" ON tournaments
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins/managers can create tournaments
CREATE POLICY "tournaments_insert_admin" ON tournaments
  FOR INSERT WITH CHECK (public.is_admin());

-- Only admins and the creator can update tournaments
CREATE POLICY "tournaments_update_admin_creator" ON tournaments
  FOR UPDATE USING (
    public.user_role() = 'SUPER_ADMIN'
    OR (public.user_role() = 'TOURNAMENT_MANAGER' AND created_by = auth.uid())
  );

-- Only super admins can delete
CREATE POLICY "tournaments_delete_super_admin" ON tournaments
  FOR DELETE USING (public.user_role() = 'SUPER_ADMIN');

-- SKILL CATEGORIES
CREATE POLICY "skill_categories_select_all" ON skill_categories
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "skill_categories_insert_admin" ON skill_categories
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "skill_categories_update_admin" ON skill_categories
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "skill_categories_delete_admin" ON skill_categories
  FOR DELETE USING (public.is_admin());

-- PLAYERS
CREATE POLICY "players_select_all" ON players
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "players_insert_admin" ON players
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "players_update_admin" ON players
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "players_delete_admin" ON players
  FOR DELETE USING (public.is_admin());

-- TEAMS
CREATE POLICY "teams_select_all" ON teams
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "teams_insert_admin" ON teams
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "teams_update_admin" ON teams
  FOR UPDATE USING (public.is_admin());

-- TEAM_PLAYERS
CREATE POLICY "team_players_select_all" ON team_players
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "team_players_insert_admin" ON team_players
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "team_players_delete_admin" ON team_players
  FOR DELETE USING (public.is_admin());

-- AUCTION SESSIONS
CREATE POLICY "auction_sessions_select_all" ON auction_sessions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "auction_sessions_insert_admin" ON auction_sessions
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "auction_sessions_update_admin" ON auction_sessions
  FOR UPDATE USING (public.is_admin());

-- AUCTION BIDS (append-only - no update or delete)
CREATE POLICY "auction_bids_select_all" ON auction_bids
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "auction_bids_insert_authenticated" ON auction_bids
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- No UPDATE or DELETE policies for auction_bids (append-only by design)

-- AUCTION RESULTS
CREATE POLICY "auction_results_select_all" ON auction_results
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "auction_results_insert_admin" ON auction_results
  FOR INSERT WITH CHECK (public.is_admin());

-- No UPDATE or DELETE (historical records are immutable)

-- FIXTURES
CREATE POLICY "fixtures_select_all" ON fixtures
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "fixtures_insert_admin" ON fixtures
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "fixtures_update_admin" ON fixtures
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "fixtures_delete_admin" ON fixtures
  FOR DELETE USING (public.is_admin());

-- MATCHES
CREATE POLICY "matches_select_all" ON matches
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "matches_insert_admin" ON matches
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "matches_update_admin" ON matches
  FOR UPDATE USING (public.is_admin());

-- MATCH PLAYERS
CREATE POLICY "match_players_select_all" ON match_players
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "match_players_insert_admin" ON match_players
  FOR INSERT WITH CHECK (public.is_admin());

-- MATCH SCORES
CREATE POLICY "match_scores_select_all" ON match_scores
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "match_scores_insert_admin" ON match_scores
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "match_scores_update_admin" ON match_scores
  FOR UPDATE USING (public.is_admin());

-- PLAYER RANKINGS
CREATE POLICY "player_rankings_select_all" ON player_rankings
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "player_rankings_insert_admin" ON player_rankings
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "player_rankings_update_admin" ON player_rankings
  FOR UPDATE USING (public.is_admin());
