-- Migration: add live commentary to live matches and expose in view
-- Safe to run multiple times

-- 1) Add commentary column to live_series_matches if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='live_series_matches' AND column_name='commentary'
  ) THEN
    ALTER TABLE public.live_series_matches ADD COLUMN commentary text;
  END IF;
END $$;

-- 2) Recreate view to include commentary as last column (avoid rename-by-position)
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
  COALESCE(lss.gender, NULL) AS gender,
  m.commentary AS commentary
FROM public.live_series_matches m
JOIN public.live_sport_series lss ON lss.id = m.series_id
JOIN public.sports s ON s.id = lss.sport_id
JOIN public.faculties f1 ON f1.id = m.faculty1_id
JOIN public.faculties f2 ON f2.id = m.faculty2_id
LEFT JOIN public.faculties wf ON wf.id = m.winner_faculty_id
WHERE m.status = 'live' AND m.is_finished = false;
