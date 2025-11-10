-- QA Edits / Hotfixes
-- Purpose: add venue to results and expose in results_view to fix frontend "Failed to load results"
-- Safe to run multiple times (idempotent-ish)

-- 1) Ensure venue column exists on public.results
DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema='public' AND table_name='results' AND column_name='venue'
	) THEN
		ALTER TABLE public.results ADD COLUMN venue text;
	END IF;
END $$;

-- NOTE: CREATE OR REPLACE VIEW cannot insert a column in the middle without a DROP first (error 42P16).
-- We drop then recreate to place venue before positions.
DROP VIEW IF EXISTS public.results_view;
CREATE VIEW public.results_view AS
SELECT
	r.id,
	s.name AS sport,
	r.event,
	r.category,
	r.gender,
	TO_CHAR(r.event_date, 'Mon DD, YYYY') AS date,
	TO_CHAR(r.event_time, 'HH12:MI AM') AS time,
	COALESCE(
		r.venue,
		(
			SELECT se.venue FROM public.scheduled_events se
			WHERE se.sport_id = r.sport_id AND se.event_date = r.event_date
			ORDER BY se.start_time DESC NULLS LAST, se.venue ASC
			LIMIT 1
		)
	) AS venue,
	(
		SELECT se.event_date FROM public.scheduled_events se
		WHERE se.sport_id = r.sport_id AND se.event_date = r.event_date
		ORDER BY se.start_time DESC NULLS LAST
		LIMIT 1
	) AS scheduled_date,
	(
		SELECT TO_CHAR(se.start_time, 'HH12:MI AM') FROM public.scheduled_events se
		WHERE se.sport_id = r.sport_id AND se.event_date = r.event_date
		ORDER BY se.start_time DESC NULLS LAST
		LIMIT 1
	) AS scheduled_time,
	COALESCE(
		(
			SELECT jsonb_agg(jsonb_build_object('place', rp.place, 'faculty', f.name) ORDER BY rp.place)
			FROM public.result_positions rp
			LEFT JOIN public.faculties f ON f.id = rp.faculty_id
			WHERE rp.result_id = r.id
		), '[]'::jsonb
	) AS positions
FROM public.results r
JOIN public.sports s ON s.id = r.sport_id;

-- 2) Ensure venue column exists on live_sport_series (series-level venue)
DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema='public' AND table_name='live_sport_series' AND column_name='venue'
	) THEN
		ALTER TABLE public.live_sport_series ADD COLUMN venue text;
	END IF;
END $$;

-- 3) Optional backfill: populate missing venues from scheduled_events by sport/date
--    This picks a deterministic venue per (sport_id, event_date) using MIN(venue)
WITH se_day AS (
	SELECT sport_id, event_date, MIN(venue) AS venue
	FROM public.scheduled_events
	GROUP BY sport_id, event_date
)
UPDATE public.results r
SET venue = se_day.venue
FROM se_day
WHERE r.venue IS NULL AND r.sport_id = se_day.sport_id AND r.event_date = se_day.event_date;

-- (Optional) helpful index if querying by venue becomes frequent
-- CREATE INDEX IF NOT EXISTS idx_results_venue ON public.results(venue);

