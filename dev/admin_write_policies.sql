-- Admin write policies (idempotent)
-- Purpose: Let authenticated admin users (emails in public.admin_users with is_active=true) write to admin-managed tables
-- Run after dev/sql.sql and dev/live_results_schema.sql

-- 0) Admin table and helper if missing
CREATE TABLE IF NOT EXISTS public.admin_users (
  email        text PRIMARY KEY,
  display_name text,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_users' AND policyname='admin_users_read_public'
  ) THEN
    CREATE POLICY admin_users_read_public ON public.admin_users FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS(SELECT 1 FROM public.admin_users au WHERE au.email = auth.email() AND au.is_active = true);
$$ LANGUAGE sql STABLE;

-- Helper: enable RLS and create read policy if missing
DO $$
DECLARE tbl text;
DECLARE pol text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'sports','faculties','faculty_sports','faculty_achievements','faculty_team_members',
    'faculty_points','scheduled_events','fixtures','results','result_positions',
    'live_sport_series','live_series_matches'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    pol := 'read_anon_' || tbl;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=tbl AND policyname=pol
    ) THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO anon USING (true);', pol, tbl);
    END IF;
    pol := 'read_auth_' || tbl;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=tbl AND policyname=pol
    ) THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true);', pol, tbl);
    END IF;
  END LOOP;
END $$;

-- 1) Core admin writes: sports and scheduled_events
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sports' AND policyname='sports_insert_admin') THEN
    CREATE POLICY sports_insert_admin ON public.sports FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sports' AND policyname='sports_update_admin') THEN
    CREATE POLICY sports_update_admin ON public.sports FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sports' AND policyname='sports_delete_admin') THEN
    CREATE POLICY sports_delete_admin ON public.sports FOR DELETE TO authenticated USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='scheduled_events' AND policyname='scheduled_events_insert_admin') THEN
    CREATE POLICY scheduled_events_insert_admin ON public.scheduled_events FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='scheduled_events' AND policyname='scheduled_events_update_admin') THEN
    CREATE POLICY scheduled_events_update_admin ON public.scheduled_events FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='scheduled_events' AND policyname='scheduled_events_delete_admin') THEN
    CREATE POLICY scheduled_events_delete_admin ON public.scheduled_events FOR DELETE TO authenticated USING (public.is_admin());
  END IF;
END $$;

-- 2) Live results writes (series + matches)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='live_sport_series' AND policyname='lss_insert_admin') THEN
    CREATE POLICY lss_insert_admin ON public.live_sport_series FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='live_sport_series' AND policyname='lss_update_admin') THEN
    CREATE POLICY lss_update_admin ON public.live_sport_series FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='live_sport_series' AND policyname='lss_delete_admin') THEN
    CREATE POLICY lss_delete_admin ON public.live_sport_series FOR DELETE TO authenticated USING (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='live_series_matches' AND policyname='lsm_insert_admin') THEN
    CREATE POLICY lsm_insert_admin ON public.live_series_matches FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='live_series_matches' AND policyname='lsm_update_admin') THEN
    CREATE POLICY lsm_update_admin ON public.live_series_matches FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='live_series_matches' AND policyname='lsm_delete_admin') THEN
    CREATE POLICY lsm_delete_admin ON public.live_series_matches FOR DELETE TO authenticated USING (public.is_admin());
  END IF;
END $$;

-- 3) Results and points writes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='results' AND policyname='results_insert_admin') THEN
    CREATE POLICY results_insert_admin ON public.results FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='results' AND policyname='results_update_admin') THEN
    CREATE POLICY results_update_admin ON public.results FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='results' AND policyname='results_delete_admin') THEN
    CREATE POLICY results_delete_admin ON public.results FOR DELETE TO authenticated USING (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='result_positions' AND policyname='result_positions_insert_admin') THEN
    CREATE POLICY result_positions_insert_admin ON public.result_positions FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='result_positions' AND policyname='result_positions_update_admin') THEN
    CREATE POLICY result_positions_update_admin ON public.result_positions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='result_positions' AND policyname='result_positions_delete_admin') THEN
    CREATE POLICY result_positions_delete_admin ON public.result_positions FOR DELETE TO authenticated USING (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_points' AND policyname='faculty_points_insert_admin') THEN
    CREATE POLICY faculty_points_insert_admin ON public.faculty_points FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_points' AND policyname='faculty_points_update_admin') THEN
    CREATE POLICY faculty_points_update_admin ON public.faculty_points FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

-- 4) Cascade helpers: allow admin writes on ref tables used by cascade tools
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_sports' AND policyname='faculty_sports_write_admin') THEN
    CREATE POLICY faculty_sports_write_admin ON public.faculty_sports FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_sports' AND policyname='faculty_sports_update_admin') THEN
    CREATE POLICY faculty_sports_update_admin ON public.faculty_sports FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_sports' AND policyname='faculty_sports_delete_admin') THEN
    CREATE POLICY faculty_sports_delete_admin ON public.faculty_sports FOR DELETE TO authenticated USING (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_achievements' AND policyname='faculty_achievements_insert_admin') THEN
    CREATE POLICY faculty_achievements_insert_admin ON public.faculty_achievements FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_achievements' AND policyname='faculty_achievements_update_admin') THEN
    CREATE POLICY faculty_achievements_update_admin ON public.faculty_achievements FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_achievements' AND policyname='faculty_achievements_delete_admin') THEN
    CREATE POLICY faculty_achievements_delete_admin ON public.faculty_achievements FOR DELETE TO authenticated USING (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_team_members' AND policyname='faculty_team_members_insert_admin') THEN
    CREATE POLICY faculty_team_members_insert_admin ON public.faculty_team_members FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_team_members' AND policyname='faculty_team_members_update_admin') THEN
    CREATE POLICY faculty_team_members_update_admin ON public.faculty_team_members FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_team_members' AND policyname='faculty_team_members_delete_admin') THEN
    CREATE POLICY faculty_team_members_delete_admin ON public.faculty_team_members FOR DELETE TO authenticated USING (public.is_admin());
  END IF;
END $$;

-- 5) (Optional) fixtures writes if you plan to manage legacy live fixtures from UI
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fixtures' AND policyname='fixtures_insert_admin') THEN
    CREATE POLICY fixtures_insert_admin ON public.fixtures FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fixtures' AND policyname='fixtures_update_admin') THEN
    CREATE POLICY fixtures_update_admin ON public.fixtures FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fixtures' AND policyname='fixtures_delete_admin') THEN
    CREATE POLICY fixtures_delete_admin ON public.fixtures FOR DELETE TO authenticated USING (public.is_admin());
  END IF;
END $$;

-- After running this script:
-- 1) Add your email(s) to public.admin_users with is_active=true
--    INSERT INTO public.admin_users(email, display_name, is_active) VALUES ('you@org.com','You',true)
--    ON CONFLICT (email) DO UPDATE SET is_active=EXCLUDED.is_active, display_name=EXCLUDED.display_name;
-- 2) Log in via /admin/login using that email (magic link) so your JWT includes the email for RLS checks.
