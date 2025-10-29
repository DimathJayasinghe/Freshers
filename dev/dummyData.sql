-- Idempotent dummy data for local testing
-- Safe to run multiple times. Assumes schema from dev/sql.sql is applied.

-- Sports
INSERT INTO public.sports (id, name, category) VALUES
	('cricket','Cricket','Team Sport'),
	('football','Football','Team Sport'),
	('basketball','Basketball','Team Sport'),
	('volleyball','Volleyball','Team Sport'),
	('athletics','Athletics','Athletics'),
	('swimming','Swimming','Swimming'),
	('badminton','Badminton','Individual Sport'),
	('table-tennis','Table Tennis','Individual Sport'),
	('tennis','Tennis','Individual Sport'),
	('chess','Chess','Individual Sport')
ON CONFLICT (id) DO NOTHING;

-- Faculties
INSERT INTO public.faculties (id,name,short_name,primary_color,secondary_color,logo_url) VALUES
	('foa','Faculty of Arts','FOA','#DC2626','#FEE2E2','/logos/faculties/arts.png'),
	('fom','Faculty of Medicine','FOM','#22C55E','#DCFCE7','/logos/faculties/medicine.png'),
	('fos','Faculty of Science','FOS','#3B82F6','#DBEAFE','/logos/faculties/science.png'),
	('ucsc','University of Colombo School of Computing','UCSC','#A855F7','#F3E8FF','/logos/faculties/ucsc.png')
ON CONFLICT (id) DO NOTHING;

-- Faculty Sports participation
INSERT INTO public.faculty_sports (faculty_id, sport_id) VALUES
	('foa','cricket'),('foa','football'),('foa','basketball'),('foa','volleyball'),('foa','badminton'),
	('fom','basketball'),('fom','volleyball'),('fom','badminton'),('fom','table-tennis'),
	('fos','cricket'),('fos','basketball'),('fos','tennis'),('fos','badminton'),('fos','athletics'),
	('ucsc','cricket'),('ucsc','football'),('ucsc','basketball'),('ucsc','badminton'),('ucsc','chess')
ON CONFLICT (faculty_id, sport_id) DO NOTHING;

-- Faculty points (leaderboard)
INSERT INTO public.faculty_points (faculty_id, mens_points, womens_points)
VALUES
	('foa', 245, 205),
	('fom', 230, 190),
	('fos', 200, 180),
	('ucsc',185, 165)
ON CONFLICT (faculty_id) DO UPDATE SET mens_points = EXCLUDED.mens_points, womens_points = EXCLUDED.womens_points, updated_at = now();

-- Achievements (optional examples)
INSERT INTO public.faculty_achievements (faculty_id, sport_id, position, year) VALUES
	('foa','cricket','Champions', 2025),
	('fom','volleyball','Champions', 2025),
	('fos','basketball','Champions', 2025),
	('ucsc','chess','Champions', 2025)
ON CONFLICT DO NOTHING;

-- Team members examples
INSERT INTO public.faculty_team_members (faculty_id, name, role, sport_id) VALUES
	('foa','Alice','Captain','cricket'),
	('fom','Brian','Captain','volleyball'),
	('fos','Cathy','Captain','basketball'),
	('ucsc','Dev','Captain','chess')
ON CONFLICT DO NOTHING;

-- Scheduled events (lineup)
-- Use today's date and a couple of future dates
WITH params AS (
	SELECT
		CURRENT_DATE AS d1,
		CURRENT_DATE + INTERVAL '1 day' AS d2
)
INSERT INTO public.scheduled_events (event_date, sport_id, sport_label, time_range, start_time, end_time, venue)
SELECT d1::date, 'cricket', NULL, '10:00 AM - 1:00 PM', '10:00'::time, '13:00'::time, 'Main Field' FROM params
UNION ALL
SELECT d1::date, 'basketball', NULL, '2:00 PM - 4:00 PM', '14:00'::time, '16:00'::time, 'Indoor Stadium' FROM params
UNION ALL
SELECT d2::date, 'athletics', 'Athletics (Track)', '8:00 AM - 12:00 PM', '08:00'::time, '12:00'::time, 'University Ground' FROM params;

-- Results (completed events) + positions
DO $$
DECLARE r1 bigint; r2 bigint;
BEGIN
	-- Insert results if not already present (identified by sport + event_date + event_time + gender)
	IF NOT EXISTS (
		SELECT 1 FROM public.results r JOIN public.sports s ON s.id=r.sport_id
		WHERE s.id='athletics' AND r.event='100m Sprint' AND r.gender='Men''s'
			AND r.event_date=CURRENT_DATE AND r.event_time='15:30'
	) THEN
		INSERT INTO public.results (sport_id, event, category, gender, event_date, event_time)
		VALUES ('athletics','100m Sprint','Athletics','Men''s', CURRENT_DATE, '15:30') RETURNING id INTO r1;
		INSERT INTO public.result_positions (result_id, place, faculty_id) VALUES
			(r1,1,'fos'),(r1,2,'ucsc'),(r1,3,'foa'),(r1,4,'fom');
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM public.results r JOIN public.sports s ON s.id=r.sport_id
		WHERE s.id='cricket' AND r.event IS NULL AND r.gender='Men''s'
			AND r.event_date=CURRENT_DATE AND r.event_time='10:00'
	) THEN
			INSERT INTO public.results (sport_id, event, category, gender, event_date, event_time)
			VALUES ('cricket', NULL,'Team Sport','Men''s', CURRENT_DATE, '10:00'::time) RETURNING id INTO r2;
			INSERT INTO public.result_positions (result_id, place, faculty_id) VALUES
				(r2,1,'foa');
	END IF;
END $$;

-- Optional: simple live fixture
INSERT INTO public.fixtures (sport_id, venue, team1_faculty_id, team2_faculty_id, scheduled_at, status, status_text, status_color)
VALUES ('cricket','Main Field','foa','ucsc', now(), 'live', 'Live - 2nd Innings', 'text-green-400')
ON CONFLICT DO NOTHING;

