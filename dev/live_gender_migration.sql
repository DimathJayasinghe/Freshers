-- Migration: add gender to live series and expose in views
-- Safe for repeated runs (idempotent-ish): creates enum if missing, adds column if missing, recreates view.

-- 1) Enum for gender
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
    CREATE TYPE gender_type AS ENUM ('male','female','mixed');
  END IF;
END $$;

-- 2) Add gender column to live_sport_series (defaults to 'male')
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='live_sport_series' AND column_name='gender'
  ) THEN
    ALTER TABLE public.live_sport_series ADD COLUMN gender gender_type NOT NULL DEFAULT 'male';
  END IF;
END $$;

-- 3) Recreate view to include gender
-- Keep existing column order and append gender at the end to avoid rename-by-position issues
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
  lss.gender AS gender
FROM public.live_series_matches m
JOIN public.live_sport_series lss ON lss.id = m.series_id
JOIN public.sports s ON s.id = lss.sport_id
JOIN public.faculties f1 ON f1.id = m.faculty1_id
JOIN public.faculties f2 ON f2.id = m.faculty2_id
LEFT JOIN public.faculties wf ON wf.id = m.winner_faculty_id
WHERE m.status = 'live' AND m.is_finished = false;

-- 4) (Optional) If you want distinct sports by gender chips, create a helper view
-- CREATE OR REPLACE VIEW public.live_sports_now_by_gender AS
-- SELECT DISTINCT lss.sport_id, s.name AS sport_name, lss.gender
-- FROM public.live_sport_series lss
-- JOIN public.sports s ON s.id = lss.sport_id
-- WHERE lss.is_finished = false;
