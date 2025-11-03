-- ============================================================
-- Seed dummy data for Live Results schema
-- Run after dev/live_results_schema.sql and dev/dummyData.sql
-- Safe-ish to re-run (guards to avoid duplicate series/matches)
-- ============================================================

-- Preflight: ensure live tables exist
DO $$
BEGIN
  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='live_sport_series';
  IF NOT FOUND THEN RAISE EXCEPTION 'Missing table public.live_sport_series. Run dev/live_results_schema.sql first.'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='live_series_matches';
  IF NOT FOUND THEN RAISE EXCEPTION 'Missing table public.live_series_matches. Run dev/live_results_schema.sql first.'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='sports';
  IF NOT FOUND THEN RAISE EXCEPTION 'Missing table public.sports. Run dev/sql.sql and dev/dummyData.sql first.'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='faculties';
  IF NOT FOUND THEN RAISE EXCEPTION 'Missing table public.faculties. Run dev/sql.sql and dev/dummyData.sql first.'; END IF;
END $$;

BEGIN;

-- =====================
-- Badminton - Live series
-- =====================
DO $$
DECLARE sid bigint;
BEGIN
  SELECT id INTO sid FROM public.live_sport_series
  WHERE sport_id='badminton' AND is_finished=false
  ORDER BY created_at DESC LIMIT 1;

  IF sid IS NULL THEN
    INSERT INTO public.live_sport_series (sport_id, title, is_finished)
    VALUES ('badminton', 'Badminton Live Session', false)
    RETURNING id INTO sid;
  END IF;

  -- Match 1: Court 1 (FOS vs FMF)
  IF NOT EXISTS (
    SELECT 1 FROM public.live_series_matches
    WHERE series_id=sid AND match_order=1
  ) THEN
    INSERT INTO public.live_series_matches (
      series_id, match_order, venue, stage, status, status_text,
      faculty1_id, faculty2_id, faculty1_score, faculty2_score, is_finished
    ) VALUES (
      sid, 1, 'Court 1', NULL, 'live', 'Game 1',
      'fos', 'fmf', '21', '18', false
    );
  END IF;

  -- Match 2: Court 2 (UCSC vs FOM)
  IF NOT EXISTS (
    SELECT 1 FROM public.live_series_matches
    WHERE series_id=sid AND match_order=2
  ) THEN
    INSERT INTO public.live_series_matches (
      series_id, match_order, venue, stage, status, status_text,
      faculty1_id, faculty2_id, faculty1_score, faculty2_score, is_finished
    ) VALUES (
      sid, 2, 'Court 2', NULL, 'live', 'Game 1',
      'ucsc', 'fom', '16', '21', false
    );
  END IF;
END $$;

-- =====================
-- Basketball - Live series
-- =====================
DO $$
DECLARE sid bigint;
BEGIN
  SELECT id INTO sid FROM public.live_sport_series
  WHERE sport_id='basketball' AND is_finished=false
  ORDER BY created_at DESC LIMIT 1;

  IF sid IS NULL THEN
    INSERT INTO public.live_sport_series (sport_id, title, is_finished)
    VALUES ('basketball', 'Basketball Live Session', false)
    RETURNING id INTO sid;
  END IF;

  -- Match 1: Indoor Stadium (UCSC vs FOM)
  IF NOT EXISTS (
    SELECT 1 FROM public.live_series_matches
    WHERE series_id=sid AND match_order=1
  ) THEN
    INSERT INTO public.live_series_matches (
      series_id, match_order, venue, stage, status, status_text,
      faculty1_id, faculty2_id, faculty1_score, faculty2_score, is_finished
    ) VALUES (
      sid, 1, 'Indoor Stadium', 'semi_final', 'live', '2nd Quarter',
      'ucsc', 'fom', '45', '42', false
    );
  END IF;

  -- Match 2: Indoor Stadium B (FOA vs FOS)
  IF NOT EXISTS (
    SELECT 1 FROM public.live_series_matches
    WHERE series_id=sid AND match_order=2
  ) THEN
    INSERT INTO public.live_series_matches (
      series_id, match_order, venue, stage, status, status_text,
      faculty1_id, faculty2_id, faculty1_score, faculty2_score, is_finished
    ) VALUES (
      sid, 2, 'Indoor Stadium B', 'semi_final', 'live', '3rd Quarter',
      'foa', 'fos', '38', '41', false
    );
  END IF;
END $$;

-- =====================
-- Cricket - Completed series (with podium)
-- =====================
DO $$
DECLARE sid bigint;
BEGIN
  SELECT id INTO sid FROM public.live_sport_series
  WHERE sport_id='cricket' AND is_finished=true
  ORDER BY created_at DESC LIMIT 1;

  IF sid IS NULL THEN
    INSERT INTO public.live_sport_series (sport_id, title, is_finished, winner_faculty_id, runner_up_faculty_id, third_place_faculty_id)
    VALUES ('cricket', 'Cricket Day Summary', true, 'fol', 'fmf', 'fos')
    RETURNING id INTO sid;
  END IF;

  -- (Optional) include a finished match record for reference
  IF NOT EXISTS (
    SELECT 1 FROM public.live_series_matches WHERE series_id=sid AND match_order=1
  ) THEN
    INSERT INTO public.live_series_matches (
      series_id, match_order, venue, stage, status, status_text,
      faculty1_id, faculty2_id, faculty1_score, faculty2_score, is_finished, winner_faculty_id
    ) VALUES (
      sid, 1, 'University Ground', 'final', 'completed', 'Final',
      'fol', 'fmf', '178/7 (20)', '172/8 (20)', true, 'fol'
    );
  END IF;
END $$;

COMMIT;
