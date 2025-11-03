-- Live Results Dedicated Schema (Supabase/Postgres)
-- Purpose: Store live results separately from fixtures and support realtime updates to clients.
-- This introduces two core tables:
--   1) live_sport_series: a live session/series per sport (e.g., today's badminton session)
--   2) live_series_matches: individual live matches under a series
-- Plus helpful views and policies for public read access and admin writes.

-- ============================
-- Prerequisites / Reuse enums
-- ============================
-- Reuse existing enums from dev/sql.sql if present
DO $$ BEGIN
  PERFORM 1 FROM pg_type WHERE typname = 'bracket_round';
  IF NOT FOUND THEN
    CREATE TYPE bracket_round AS ENUM ('round_of_16','quarter_final','semi_final','final');
  END IF;
END $$;

DO $$ BEGIN
  PERFORM 1 FROM pg_type WHERE typname = 'match_status';
  IF NOT FOUND THEN
    CREATE TYPE match_status AS ENUM ('scheduled','live','completed','delayed','cancelled');
  END IF;
END $$;

-- ============================
-- Tables
-- ============================
CREATE TABLE IF NOT EXISTS public.live_sport_series (
  id                 bigserial PRIMARY KEY,
  sport_id           text NOT NULL REFERENCES public.sports(id) ON DELETE RESTRICT,
  title              text,                            -- optional label (e.g., 'Badminton Day 1')
  is_finished        boolean NOT NULL DEFAULT false,  -- marks the series completed
  winner_faculty_id  text REFERENCES public.faculties(id) ON DELETE SET NULL,
  runner_up_faculty_id text REFERENCES public.faculties(id) ON DELETE SET NULL,
  third_place_faculty_id text REFERENCES public.faculties(id) ON DELETE SET NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.live_series_matches (
  id                   bigserial PRIMARY KEY,
  series_id            bigint NOT NULL REFERENCES public.live_sport_series(id) ON DELETE CASCADE,
  match_order          int NOT NULL DEFAULT 1,                -- display ordering within series
  venue                text,                                   -- e.g., 'Court 1'
  stage                bracket_round,                          -- if applicable: quarter_final, semi_final, final
  status               match_status NOT NULL DEFAULT 'live',   -- primarily 'live' here
  status_text          text,                                   -- free text e.g., 'Game 1', '2nd innings'
  faculty1_id          text NOT NULL REFERENCES public.faculties(id) ON DELETE RESTRICT,
  faculty2_id          text NOT NULL REFERENCES public.faculties(id) ON DELETE RESTRICT,
  faculty1_score       text,                                   -- flexible scores per sport
  faculty2_score       text,
  is_finished          boolean NOT NULL DEFAULT false,
  winner_faculty_id    text REFERENCES public.faculties(id) ON DELETE SET NULL,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CHECK (faculty1_id <> faculty2_id)
);

-- Keep ordering unique within series
CREATE UNIQUE INDEX IF NOT EXISTS idx_live_series_matches_series_order
  ON public.live_series_matches(series_id, match_order);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_live_sport_series_sport ON public.live_sport_series(sport_id);
CREATE INDEX IF NOT EXISTS idx_live_series_matches_series ON public.live_series_matches(series_id);
CREATE INDEX IF NOT EXISTS idx_live_series_matches_status ON public.live_series_matches(status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_live_series_set_ts'
  ) THEN
    CREATE TRIGGER trg_live_series_set_ts
    BEFORE UPDATE ON public.live_sport_series
    FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_live_matches_set_ts'
  ) THEN
    CREATE TRIGGER trg_live_matches_set_ts
    BEFORE UPDATE ON public.live_series_matches
    FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
  END IF;
END $$;

-- ============================
-- Views
-- ============================
-- Distinct sports currently live (any series not finished)
CREATE OR REPLACE VIEW public.live_sports_now AS
SELECT DISTINCT s.id AS sport_id, s.name AS sport_name
FROM public.live_sport_series lss
JOIN public.sports s ON s.id = lss.sport_id
WHERE lss.is_finished = false;

-- Live matches with resolved faculty names
CREATE OR REPLACE VIEW public.live_series_matches_view AS
SELECT
  m.id,
  m.series_id,
  lss.sport_id,
  s.name AS sport_name,
  m.match_order,
  m.venue,
  m.stage,
  m.status,
  m.status_text,
  f1.name AS team1,
  f2.name AS team2,
  m.faculty1_score AS team1_score,
  m.faculty2_score AS team2_score,
  m.is_finished,
  wf.name AS winner_name
FROM public.live_series_matches m
JOIN public.live_sport_series lss ON lss.id = m.series_id
JOIN public.sports s ON s.id = lss.sport_id
JOIN public.faculties f1 ON f1.id = m.faculty1_id
JOIN public.faculties f2 ON f2.id = m.faculty2_id
LEFT JOIN public.faculties wf ON wf.id = m.winner_faculty_id
WHERE m.status = 'live' AND m.is_finished = false;

-- ============================
-- RLS + Policies
-- ============================
ALTER TABLE public.live_sport_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_series_matches ENABLE ROW LEVEL SECURITY;

-- Read-only for public (anon + authenticated)
DO $$
DECLARE tbl text;
DECLARE pol text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['live_sport_series', 'live_series_matches'] LOOP
    pol := 'read_anon_' || tbl;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl AND policyname = pol
    ) THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO anon USING (true);', pol, tbl);
    END IF;

    pol := 'read_auth_' || tbl;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl AND policyname = pol
    ) THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true);', pol, tbl);
    END IF;
  END LOOP;
END $$;

-- NOTE: For admin writes, create policies limited to service_role or a dedicated admin role.
-- Example (service_role only):
-- CREATE POLICY write_service_live_series ON public.live_sport_series
--   FOR INSERT TO service_role WITH CHECK (true);
-- CREATE POLICY update_service_live_series ON public.live_sport_series
--   FOR UPDATE TO service_role USING (true) WITH CHECK (true);
-- CREATE POLICY write_service_live_matches ON public.live_series_matches
--   FOR INSERT TO service_role WITH CHECK (true);
-- CREATE POLICY update_service_live_matches ON public.live_series_matches
--   FOR UPDATE TO service_role USING (true) WITH CHECK (true);

-- ============================
-- Realtime notes
-- ============================
-- Supabase Realtime streams changes automatically when enabled for the schema/table
-- (via the Supabase Dashboard: Database → Replication → Realtime). Ensure both
-- public.live_sport_series and public.live_series_matches are enabled for Realtime.
-- Frontend can subscribe to postgres_changes on these tables to get instant updates.
