-- Admin authentication & RLS policies
-- Run this after dev/sql.sql and (optionally) dev/live_results_schema.sql



-- =====================
-- Admin directory
-- =====================
CREATE TABLE IF NOT EXISTS public.admin_users (
  email        text PRIMARY KEY,
  display_name text,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Read policy (clients check if they are admin). For stricter setups, limit to authenticated only.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_users' AND policyname='admin_users_read_public'
  ) THEN
    CREATE POLICY admin_users_read_public ON public.admin_users FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

-- Seed example admin account(s) (replace with your emails)
INSERT INTO public.admin_users (email, display_name, is_active)
VALUES
  ('admin@example.com','Admin User', true)
ON CONFLICT (email) DO UPDATE SET display_name=EXCLUDED.display_name, is_active=EXCLUDED.is_active;

-- =====================
-- Helper: policy predicate to check admin
-- =====================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS(SELECT 1 FROM public.admin_users au WHERE au.email = auth.email() AND au.is_active = true);
$$ LANGUAGE sql STABLE;

-- =====================
-- RLS write policies for admin on live tables
-- =====================
DO $$
BEGIN
  -- live_sport_series
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='live_sport_series') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='live_sport_series' AND policyname='lss_insert_admin') THEN
      CREATE POLICY lss_insert_admin ON public.live_sport_series FOR INSERT TO authenticated WITH CHECK (public.is_admin());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='live_sport_series' AND policyname='lss_update_admin') THEN
      CREATE POLICY lss_update_admin ON public.live_sport_series FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='live_sport_series' AND policyname='lss_delete_admin') THEN
      CREATE POLICY lss_delete_admin ON public.live_sport_series FOR DELETE TO authenticated USING (public.is_admin());
    END IF;
  END IF;

  -- live_series_matches
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='live_series_matches') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='live_series_matches' AND policyname='lsm_insert_admin') THEN
      CREATE POLICY lsm_insert_admin ON public.live_series_matches FOR INSERT TO authenticated WITH CHECK (public.is_admin());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='live_series_matches' AND policyname='lsm_update_admin') THEN
      CREATE POLICY lsm_update_admin ON public.live_series_matches FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='live_series_matches' AND policyname='lsm_delete_admin') THEN
      CREATE POLICY lsm_delete_admin ON public.live_series_matches FOR DELETE TO authenticated USING (public.is_admin());
    END IF;
  END IF;
END $$;

-- =====================
-- RLS write policies for admin on results + points
-- =====================
DO $$
BEGIN
  -- results
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='results' AND policyname='results_insert_admin') THEN
    CREATE POLICY results_insert_admin ON public.results FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='results' AND policyname='results_update_admin') THEN
    CREATE POLICY results_update_admin ON public.results FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='results' AND policyname='results_delete_admin') THEN
    CREATE POLICY results_delete_admin ON public.results FOR DELETE TO authenticated USING (public.is_admin());
  END IF;

  -- result_positions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='result_positions' AND policyname='result_positions_insert_admin') THEN
    CREATE POLICY result_positions_insert_admin ON public.result_positions FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='result_positions' AND policyname='result_positions_update_admin') THEN
    CREATE POLICY result_positions_update_admin ON public.result_positions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='result_positions' AND policyname='result_positions_delete_admin') THEN
    CREATE POLICY result_positions_delete_admin ON public.result_positions FOR DELETE TO authenticated USING (public.is_admin());
  END IF;

  -- faculty_points
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_points' AND policyname='faculty_points_upsert_admin') THEN
    CREATE POLICY faculty_points_upsert_admin ON public.faculty_points FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_points' AND policyname='faculty_points_update_admin') THEN
    CREATE POLICY faculty_points_update_admin ON public.faculty_points FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;
