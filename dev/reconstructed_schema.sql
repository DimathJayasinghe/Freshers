-- Freshers DB: clean, deduplicated, backward-compatible schema
-- Safe to run multiple times (guards and IF NOT EXISTS used where possible)
-- Targets Supabase/PostgreSQL 15

-- =============================
-- 1) Canonical enums
-- =============================
DO $$ BEGIN
  PERFORM 1 FROM pg_type WHERE typname='sport_category';
  IF NOT FOUND THEN
    CREATE TYPE sport_category AS ENUM ('Team Sport','Individual Sport','Athletics','Swimming');
  END IF;
END $$;

DO $$ BEGIN
  PERFORM 1 FROM pg_type WHERE typname='sport_gender';
  IF NOT FOUND THEN
    CREATE TYPE sport_gender AS ENUM ('Mens','Womens','Both');
  END IF;
END $$;

DO $$ BEGIN
  PERFORM 1 FROM pg_type WHERE typname='gender_type';
  IF NOT FOUND THEN
    CREATE TYPE gender_type AS ENUM ('male','female','mixed');
  END IF;
END $$;

DO $$ BEGIN
  PERFORM 1 FROM pg_type WHERE typname='match_status';
  IF NOT FOUND THEN
    CREATE TYPE match_status AS ENUM ('scheduled','live','completed','delayed','cancelled');
  END IF;
END $$;

DO $$ BEGIN
  PERFORM 1 FROM pg_type WHERE typname='bracket_round';
  IF NOT FOUND THEN
    CREATE TYPE bracket_round AS ENUM ('round_of_16','quarter_final','semi_final','final');
  END IF;
END $$;

-- =============================
-- 2) Utility functions & triggers
-- =============================
CREATE OR REPLACE FUNCTION public.set_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Is current session user an active admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users au
    WHERE au.email = auth.email() AND au.is_active = true
  );
$$ LANGUAGE sql STABLE;

-- =============================
-- 3) Core reference tables
-- =============================
CREATE TABLE IF NOT EXISTS public.admin_users (
  email        text PRIMARY KEY,
  display_name text,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sports (
  id         text PRIMARY KEY,                        -- e.g. 'cricket', 'football'
  name       text NOT NULL,
  category   sport_category NOT NULL,                 -- matches app types
  gender     sport_gender NOT NULL DEFAULT 'Both',    -- 'Mens' | 'Womens' | 'Both'
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(name)
);

CREATE TABLE IF NOT EXISTS public.faculties (
  id              text PRIMARY KEY,
  name            text NOT NULL,
  short_name      text NOT NULL,
  primary_color   text NOT NULL CHECK (primary_color ~ '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'),
  secondary_color text NOT NULL CHECK (secondary_color ~ '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'),
  logo_url        text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(name),
  UNIQUE(short_name)
);

CREATE TABLE IF NOT EXISTS public.faculty_sports (
  faculty_id text NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
  sport_id   text NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  PRIMARY KEY (faculty_id, sport_id)
);

CREATE TABLE IF NOT EXISTS public.faculty_achievements (
  id         bigserial PRIMARY KEY,
  faculty_id text NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
  sport_id   text REFERENCES public.sports(id) ON DELETE SET NULL,
  position   text NOT NULL,                      -- 'Champions', 'Runner-up', etc.
  year       int CHECK (year IS NULL OR year BETWEEN 1900 AND 2100),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.faculty_team_members (
  id         bigserial PRIMARY KEY,
  faculty_id text NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
  name       text NOT NULL,
  role       text NOT NULL,                      -- 'Captain', 'Vice Captain', ...
  sport_id   text REFERENCES public.sports(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.faculty_points (
  faculty_id    text PRIMARY KEY REFERENCES public.faculties(id) ON DELETE CASCADE,
  mens_points   numeric(12,2) NOT NULL DEFAULT 0,
  womens_points numeric(12,2) NOT NULL DEFAULT 0,
  total_points  numeric(14,2) GENERATED ALWAYS AS (COALESCE(mens_points,0)::numeric + COALESCE(womens_points,0)::numeric) STORED,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Migrate existing integer columns to numeric for fractional points (ties)
DO $$ BEGIN
  -- Always drop generated column before altering dependent column types
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='faculty_points' AND column_name='total_points'
  ) THEN
    ALTER TABLE public.faculty_points DROP COLUMN total_points;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='faculty_points' AND column_name='mens_points' AND data_type <> 'numeric'
  ) THEN
    ALTER TABLE public.faculty_points ALTER COLUMN mens_points TYPE numeric(12,2) USING mens_points::numeric;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='faculty_points' AND column_name='womens_points' AND data_type <> 'numeric'
  ) THEN
    ALTER TABLE public.faculty_points ALTER COLUMN womens_points TYPE numeric(12,2) USING womens_points::numeric;
  END IF;

  -- Recreate generated column (numeric)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='faculty_points' AND column_name='total_points'
  ) THEN
    ALTER TABLE public.faculty_points ADD COLUMN total_points numeric(14,2) GENERATED ALWAYS AS (COALESCE(mens_points,0)::numeric + COALESCE(womens_points,0)::numeric) STORED;
  END IF;
END $$;

-- Update timestamp on change
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname='trg_faculty_points_set_ts'
  ) THEN
    CREATE TRIGGER trg_faculty_points_set_ts
    BEFORE UPDATE ON public.faculty_points
    FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
  END IF;
END $$;

CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  RANK() OVER (ORDER BY fp.total_points DESC, f.short_name) AS rank,
  f.name,
  f.short_name AS code,
  fp.mens_points,
  fp.womens_points,
  fp.total_points
FROM public.faculty_points fp
JOIN public.faculties f ON f.id = fp.faculty_id;

-- =============================
-- 4) Schedule (Lineup)
-- =============================
CREATE TABLE IF NOT EXISTS public.scheduled_events (
  id          bigserial PRIMARY KEY,
  event_date  date NOT NULL,
  sport_id    text REFERENCES public.sports(id) ON DELETE SET NULL,
  sport_label text,
  time_range  text,
  start_time  time,
  end_time    time,
  venue       text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- =============================
-- 5) Legacy simple live fixtures (kept for backward compatibility)
-- =============================
CREATE TABLE IF NOT EXISTS public.fixtures (
  id                bigserial PRIMARY KEY,
  sport_id          text NOT NULL REFERENCES public.sports(id) ON DELETE RESTRICT,
  venue             text NOT NULL,
  team1_faculty_id  text NOT NULL REFERENCES public.faculties(id) ON DELETE RESTRICT,
  team2_faculty_id  text NOT NULL REFERENCES public.faculties(id) ON DELETE RESTRICT,
  scheduled_at      timestamptz NOT NULL,
  status            match_status NOT NULL DEFAULT 'scheduled',
  status_text       text,
  status_color      text,
  round_name        text,
  team1_score       text,
  team2_score       text,
  winner_faculty_id text REFERENCES public.faculties(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  CHECK (team1_faculty_id <> team2_faculty_id)
);

CREATE OR REPLACE VIEW public.live_matches AS
SELECT
  fx.id,
  s.name AS sport,
  fx.venue,
  f1.name AS team1,
  f2.name AS team2,
  COALESCE(fx.status_text, 'Live') AS status,
  COALESCE(fx.status_color, 'text-green-400') AS status_color
FROM public.fixtures fx
JOIN public.sports s ON s.id = fx.sport_id
JOIN public.faculties f1 ON f1.id = fx.team1_faculty_id
JOIN public.faculties f2 ON f2.id = fx.team2_faculty_id
WHERE fx.status = 'live';

-- Backfill: add status_color if fixtures existed before this schema
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='fixtures' AND column_name='status_color'
  ) THEN
    ALTER TABLE public.fixtures ADD COLUMN status_color text;
  END IF;
END $$;

-- =============================
-- 6) Live series + matches (new live system)
-- =============================
CREATE TABLE IF NOT EXISTS public.live_sport_series (
  id                    bigserial PRIMARY KEY,
  sport_id              text NOT NULL REFERENCES public.sports(id) ON DELETE RESTRICT,
  title                 text,
  gender                gender_type NOT NULL DEFAULT 'male',
  is_finished           boolean NOT NULL DEFAULT false,
  winner_faculty_id     text REFERENCES public.faculties(id) ON DELETE SET NULL,
  runner_up_faculty_id  text REFERENCES public.faculties(id) ON DELETE SET NULL,
  third_place_faculty_id text REFERENCES public.faculties(id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.live_series_matches (
  id                 bigserial PRIMARY KEY,
  series_id          bigint NOT NULL REFERENCES public.live_sport_series(id) ON DELETE CASCADE,
  match_order        int NOT NULL DEFAULT 1,
  venue              text,
  stage              bracket_round,
  status             match_status NOT NULL DEFAULT 'live',
  status_text        text,
  faculty1_id        text NOT NULL REFERENCES public.faculties(id) ON DELETE RESTRICT,
  faculty2_id        text NOT NULL REFERENCES public.faculties(id) ON DELETE RESTRICT,
  faculty1_score     text,
  faculty2_score     text,
  is_finished        boolean NOT NULL DEFAULT false,
  winner_faculty_id  text REFERENCES public.faculties(id) ON DELETE SET NULL,
  commentary         text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  CHECK (faculty1_id <> faculty2_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lsm_series_order ON public.live_series_matches(series_id, match_order);
CREATE INDEX IF NOT EXISTS idx_lss_sport ON public.live_sport_series(sport_id);
CREATE INDEX IF NOT EXISTS idx_lsm_series ON public.live_series_matches(series_id);
CREATE INDEX IF NOT EXISTS idx_lsm_status ON public.live_series_matches(status);

-- Auto-update updated_at
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_live_series_set_ts') THEN
    CREATE TRIGGER trg_live_series_set_ts
    BEFORE UPDATE ON public.live_sport_series
    FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_live_matches_set_ts') THEN
    CREATE TRIGGER trg_live_matches_set_ts
    BEFORE UPDATE ON public.live_series_matches
    FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
  END IF;
END $$;

CREATE OR REPLACE VIEW public.live_sports_now AS
SELECT DISTINCT s.id AS sport_id, s.name AS sport_name
FROM public.live_sport_series lss
JOIN public.sports s ON s.id = lss.sport_id
WHERE lss.is_finished = false;

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
  wf.name AS winner_name,
  lss.gender AS gender,
  m.commentary AS commentary
FROM public.live_series_matches m
JOIN public.live_sport_series lss ON lss.id = m.series_id
JOIN public.sports s ON s.id = lss.sport_id
JOIN public.faculties f1 ON f1.id = m.faculty1_id
JOIN public.faculties f2 ON f2.id = m.faculty2_id
LEFT JOIN public.faculties wf ON wf.id = m.winner_faculty_id
WHERE m.status = 'live' AND m.is_finished = false;

-- =============================
-- 7) Results (completed events)
-- =============================
CREATE TABLE IF NOT EXISTS public.results (
  id         bigserial PRIMARY KEY,
  sport_id   text NOT NULL REFERENCES public.sports(id) ON DELETE RESTRICT,
  event      text,                                   -- e.g. '100m Sprint', 'Singles Final', or overall
  category   sport_category NOT NULL,
  gender     text NOT NULL CHECK (gender IN ('Men''s','Women''s','Mixed')),
  event_date date NOT NULL,
  event_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.result_positions (
  result_id  bigint NOT NULL REFERENCES public.results(id) ON DELETE CASCADE,
  place      int NOT NULL CHECK (place > 0),
  faculty_id text NOT NULL REFERENCES public.faculties(id) ON DELETE RESTRICT,
  PRIMARY KEY (result_id, place, faculty_id)
);

-- Ensure schema allows multiple faculties per place and prevents duplicates per result
DO $$
DECLARE pk_name text;
DECLARE cols text;
BEGIN
  -- Detect current primary key definition
  SELECT conname, pg_get_constraintdef(oid)
  INTO pk_name, cols
  FROM pg_constraint
  WHERE conrelid = 'public.result_positions'::regclass AND contype = 'p'
  LIMIT 1;

  -- If PK is missing or not on (result_id, place, faculty_id), recreate it correctly
  IF pk_name IS NULL OR cols NOT LIKE '%(result_id, place, faculty_id)%' THEN
    IF pk_name IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.result_positions DROP CONSTRAINT %I;', pk_name);
    END IF;
    ALTER TABLE public.result_positions ADD PRIMARY KEY (result_id, place, faculty_id);
  END IF;

  -- Ensure unique (result_id, faculty_id) to prevent duplicates for same faculty in same result
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid='public.result_positions'::regclass AND conname='uniq_result_faculty_once'
  ) THEN
    ALTER TABLE public.result_positions ADD CONSTRAINT uniq_result_faculty_once UNIQUE (result_id, faculty_id);
  END IF;
END $$;

CREATE OR REPLACE VIEW public.results_view AS
SELECT
  r.id,
  s.name AS sport,
  r.event,
  r.category,
  r.gender,
  TO_CHAR(r.event_date, 'Mon DD, YYYY') AS date,
  TO_CHAR(r.event_time, 'HH12:MI AM') AS time,
  COALESCE(
    (
      SELECT jsonb_agg(jsonb_build_object('place', rp.place, 'faculty', f.name) ORDER BY rp.place)
      FROM public.result_positions rp
      JOIN public.faculties f ON f.id = rp.faculty_id
      WHERE rp.result_id = r.id
    ), '[]'::jsonb
  ) AS positions
FROM public.results r
JOIN public.sports s ON s.id = r.sport_id;

-- =============================
-- 8) Helpful indexes
-- =============================
CREATE INDEX IF NOT EXISTS idx_faculty_sports_sport ON public.faculty_sports (sport_id);
CREATE INDEX IF NOT EXISTS idx_faculty_achievements_fac_sport ON public.faculty_achievements (faculty_id, sport_id);
CREATE INDEX IF NOT EXISTS idx_faculty_team_members_fac ON public.faculty_team_members (faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_points_total ON public.faculty_points (total_points DESC);
CREATE INDEX IF NOT EXISTS idx_fixtures_sport_time ON public.fixtures (sport_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_events_date ON public.scheduled_events (event_date);
CREATE INDEX IF NOT EXISTS idx_results_date_time ON public.results (event_date DESC, event_time DESC);
CREATE INDEX IF NOT EXISTS idx_result_positions_result ON public.result_positions (result_id);

-- =============================
-- 9) Row-Level Security (RLS) and policies
-- =============================
-- Enable RLS for all user-facing tables
DO $$
DECLARE tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'admin_users','sports','faculties','faculty_sports','faculty_achievements','faculty_team_members',
    'faculty_points','scheduled_events','fixtures','live_sport_series','live_series_matches','results','result_positions'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
  END LOOP;
END $$;

-- Public read for reference data
DO $$
DECLARE tbl text;
DECLARE polname text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['sports','faculties','faculty_sports','faculty_achievements','faculty_team_members','faculty_points','scheduled_events','fixtures','results','result_positions','live_sport_series','live_series_matches','admin_users'] LOOP
    polname := 'read_public_' || tbl;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=tbl AND policyname=polname
    ) THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true);', polname, tbl);
    END IF;
  END LOOP;
END $$;

-- Admin writes: use public.is_admin()
DO $$
DECLARE tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['sports','scheduled_events','fixtures','live_sport_series','live_series_matches','results','result_positions','faculty_points','faculty_sports','faculty_achievements','faculty_team_members'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=tbl AND policyname=tbl||'_insert_admin') THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_admin());', tbl||'_insert_admin', tbl);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=tbl AND policyname=tbl||'_update_admin') THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());', tbl||'_update_admin', tbl);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=tbl AND policyname=tbl||'_delete_admin') THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_admin());', tbl||'_delete_admin', tbl);
    END IF;
  END LOOP;
END $$;

-- Public read (only) for admin_users list (used to validate email)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_users' AND policyname='admin_users_read_public'
  ) THEN
    CREATE POLICY admin_users_read_public ON public.admin_users FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

-- Optional: seed an admin (replace email before running or remove)
-- INSERT INTO public.admin_users (email, display_name, is_active)
-- VALUES ('admin@example.com','Admin User', true)
-- ON CONFLICT (email) DO UPDATE SET display_name=EXCLUDED.display_name, is_active=EXCLUDED.is_active;

-- (Deprecated duplicate migration block removed)
