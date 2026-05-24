-- =============================================================
-- fix.sql — Run this entire script in the Supabase SQL Editor
-- Fixes:
--   1. Table GRANTs lost when schema was dropped and recreated
--   2. auth.users trigger (safe version, no enum casting)
--   3. Missing admin profile row
-- =============================================================

-- -------------------------------------------------------------
-- 1. Fix table-level GRANTs
--    (These are dropped when you do DROP SCHEMA public CASCADE)
-- -------------------------------------------------------------

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Also grant execute on all functions so helpers like user_role() work
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon, service_role;

-- -------------------------------------------------------------
-- 2. Fix the trigger — safe version with NO enum casting
--    (The old version tried to cast raw_user_meta_data->>'role'
--     to the user_role enum which throws on invalid values)
-- -------------------------------------------------------------

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'CAPTAIN'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- -------------------------------------------------------------
-- 3. Insert / update the Super Admin profile
--    User: prahaasm@gmail.com
--    Auth UUID: 1843ffde-52a1-41b3-95b7-7f8778c738ea
-- -------------------------------------------------------------

INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  '1843ffde-52a1-41b3-95b7-7f8778c738ea',
  'prahaasm@gmail.com',
  'Super Admin',
  'SUPER_ADMIN'
)
ON CONFLICT (id) DO UPDATE
  SET role      = 'SUPER_ADMIN',
      full_name = 'Super Admin',
      email     = 'prahaasm@gmail.com';

-- Verify
SELECT id, email, full_name, role FROM public.profiles WHERE id = '1843ffde-52a1-41b3-95b7-7f8778c738ea';

-- -------------------------------------------------------------
-- 4. Schema migrations (safe to run on existing DB)
-- -------------------------------------------------------------
ALTER TABLE skill_categories ADD COLUMN IF NOT EXISTS is_captain_category BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tournaments DROP COLUMN IF EXISTS captain_base_price;
