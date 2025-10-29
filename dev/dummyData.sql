-- ============================================================
-- Seed dummy data to match your frontend sample content
-- Safe-ish to re-run (uses upserts and NOT EXISTS guards)
-- ============================================================
-- Preflight: ensure schema/tables exist (run dev/sql.sql first)
DO $$
DECLARE missing int := 0;
BEGIN
  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='sports';
  IF NOT FOUND THEN RAISE EXCEPTION 'Missing required table public.sports. Run dev/sql.sql first.'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='faculties';
  IF NOT FOUND THEN RAISE EXCEPTION 'Missing required table public.faculties. Run dev/sql.sql first.'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='faculty_sports';
  IF NOT FOUND THEN RAISE EXCEPTION 'Missing required table public.faculty_sports. Run dev/sql.sql first.'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='faculty_achievements';
  IF NOT FOUND THEN RAISE EXCEPTION 'Missing required table public.faculty_achievements. Run dev/sql.sql first.'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='faculty_team_members';
  IF NOT FOUND THEN RAISE EXCEPTION 'Missing required table public.faculty_team_members. Run dev/sql.sql first.'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='faculty_points';
  IF NOT FOUND THEN RAISE EXCEPTION 'Missing required table public.faculty_points. Run dev/sql.sql first.'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='scheduled_events';
  IF NOT FOUND THEN RAISE EXCEPTION 'Missing required table public.scheduled_events. Run dev/sql.sql first.'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='fixtures';
  IF NOT FOUND THEN RAISE EXCEPTION 'Missing required table public.fixtures. Run dev/sql.sql first.'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='results';
  IF NOT FOUND THEN RAISE EXCEPTION 'Missing required table public.results. Run dev/sql.sql first.'; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='result_positions';
  IF NOT FOUND THEN RAISE EXCEPTION 'Missing required table public.result_positions. Run dev/sql.sql first.'; END IF;
END $$;

BEGIN;

-- ---------- Sports (from src/data/sportsData.ts) ----------
INSERT INTO public.sports (id, name, category) VALUES
  ('cricket','Cricket','Team Sport'),
  ('football','Football','Team Sport'),
  ('basketball','Basketball','Team Sport'),
  ('volleyball','Volleyball','Team Sport'),
  ('netball','Netball','Team Sport'),
  ('hockey','Hockey','Team Sport'),
  ('rugby','Rugby','Team Sport'),
  ('athletics','Athletics','Athletics'),
  ('badminton','Badminton','Individual Sport'),
  ('table-tennis','Table Tennis','Individual Sport'),
  ('tennis','Tennis','Individual Sport'),
  ('squash','Squash','Individual Sport'),
  ('swimming','Swimming','Swimming'),
  ('water-polo','Water Polo','Swimming'),
  ('chess','Chess','Individual Sport'),
  ('carrom','Carrom','Individual Sport'),
  ('elle','Elle','Team Sport')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category;

-- ---------- Faculties (from src/data/facultiesData.ts) ----------
INSERT INTO public.faculties (id, name, short_name, primary_color, secondary_color, logo_url) VALUES
  ('foa', 'Faculty of Arts', 'FOA', '#DC2626', '#FEE2E2', '/logos/faculties/arts.png'),
  ('fom', 'Faculty of Medicine', 'FOM', '#22C55E', '#DCFCE7', '/logos/faculties/medicine.png'),
  ('fos', 'Faculty of Science', 'FOS', '#3B82F6', '#DBEAFE', '/logos/faculties/science.png'),
  ('ucsc','University of Colombo School of Computing','UCSC','#A855F7','#F3E8FF','/logos/faculties/ucsc.png'),
  ('fmf', 'Faculty of Management & Finance', 'FMF', '#F59E0B', '#FEF3C7', '/logos/faculties/management.png'),
  ('fol', 'Faculty of Law', 'FOL', '#EF4444', '#FEE2E2', '/logos/faculties/law.png'),
  ('foe', 'Faculty of Education', 'FOE', '#06B6D4', '#CFFAFE', '/logos/faculties/education.png'),
  ('fot', 'Faculty of Technology', 'FOT', '#8B5CF6', '#EDE9FE', '/logos/faculties/technology.png'),
  ('fon', 'Faculty of Nursing', 'FON', '#EC4899', '#FCE7F3', '/logos/faculties/nursing.png'),
  ('fim', 'Faculty of Indigenous Medicine', 'FIM', '#14B8A6', '#CCFBF1', '/logos/faculties/indigenous-medicine.png'),
  ('spc', 'Sri Palee Campus', 'SPC', '#F97316', '#FFEDD5', '/logos/faculties/sri-palee.png')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    short_name = EXCLUDED.short_name,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color,
    logo_url = EXCLUDED.logo_url;

-- ---------- Faculty x Sports (from facultiesData.sportsParticipated) ----------
INSERT INTO public.faculty_sports (faculty_id, sport_id) VALUES
  -- FOA
  ('foa','cricket'),('foa','football'),('foa','basketball'),('foa','volleyball'),('foa','badminton'),
  -- FOM
  ('fom','basketball'),('fom','volleyball'),('fom','badminton'),('fom','table-tennis'),
  -- FOS
  ('fos','cricket'),('fos','basketball'),('fos','tennis'),('fos','badminton'),('fos','athletics'),
  -- UCSC
  ('ucsc','cricket'),('ucsc','football'),('ucsc','basketball'),('ucsc','badminton'),('ucsc','chess'),
  -- FMF
  ('fmf','cricket'),('fmf','football'),('fmf','basketball'),('fmf','table-tennis'),
  -- FOL
  ('fol','football'),('fol','cricket'),('fol','volleyball'),('fol','badminton'),
  -- FOE
  ('foe','volleyball'),('foe','netball'),('foe','badminton'),('foe','athletics'),
  -- FOT
  ('fot','basketball'),('fot','football'),('fot','cricket'),('fot','athletics'),
  -- FON
  ('fon','netball'),('fon','volleyball'),('fon','badminton'),('fon','table-tennis'),
  -- FIM
  ('fim','cricket'),('fim','volleyball'),('fim','athletics'),('fim','table-tennis'),
  -- SPC
  ('spc','cricket'),('spc','football'),('spc','athletics'),('spc','volleyball')
ON CONFLICT DO NOTHING;

-- ---------- Achievements (from facultiesData.achievements) ----------
INSERT INTO public.faculty_achievements (faculty_id, sport_id, position, year) VALUES
  ('foa','cricket','Champions',2024),
  ('foa','football','Runner-up',2024),
  ('fom','volleyball','Champions',2024),
  ('fos','basketball','Champions',2024),
  ('fos','cricket','Semi-finalists',2024),
  ('ucsc','chess','Champions',2024),
  ('ucsc','football','Quarter-finalists',2024),
  ('fmf','table-tennis','Runner-up',2024),
  ('fol','badminton','Semi-finalists',2024),
  ('foe','netball','Champions',2024),
  ('fot','athletics','Runner-up',2024),
  ('fon','netball','Runner-up',2024),
  ('fim','athletics','Third place',2024),
  ('spc','cricket','Quarter-finalists',2024)
ON CONFLICT DO NOTHING;

-- ---------- Team Members (from facultiesData.teamMembers) ----------
INSERT INTO public.faculty_team_members (faculty_id, name, role, sport_id) VALUES
  ('foa','Captain Name','Captain','cricket'),
  ('foa','Vice Captain','Vice Captain','football')
ON CONFLICT DO NOTHING;

-- ---------- Leaderboard/Points (from src/data/leaderboardData.ts) ----------
-- Uses faculties.short_name = code
INSERT INTO public.faculty_points (faculty_id, mens_points, womens_points, rank_position)
SELECT f.id, lb.mens_points, lb.womens_points, NULL
FROM (
  VALUES
    ('FOA',245,205),
    ('FOM',230,190),
    ('FOS',200,180),
    ('UCSC',185,165),
    ('FMF',170,150),
    ('FOL',150,130),
    ('FOE',140,120),
    ('FOT',130,110),
    ('FON',115,100),
    ('FIM',100, 90),
    ('SPC', 85, 80)
) AS lb(code, mens_points, womens_points)
JOIN public.faculties f ON f.short_name = lb.code
ON CONFLICT (faculty_id) DO UPDATE
SET mens_points   = EXCLUDED.mens_points,
    womens_points = EXCLUDED.womens_points,
    updated_at    = now();

-- ---------- Live Fixtures (from src/data/homeData.ts liveMatches) ----------
-- Create two live fixtures with now() as scheduled time
INSERT INTO public.fixtures
  (sport_id, venue, team1_faculty_id, team2_faculty_id, scheduled_at, status, status_text, status_color, round_name)
SELECT 'cricket', 'University Ground', 'foa', 'fos', now(), 'live', 'Live - 2nd Innings', 'text-green-400', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.fixtures
  WHERE sport_id='cricket' AND team1_faculty_id='foa' AND team2_faculty_id='fos' AND status='live'
);
INSERT INTO public.fixtures
  (sport_id, venue, team1_faculty_id, team2_faculty_id, scheduled_at, status, status_text, status_color, round_name)
SELECT 'basketball', 'Indoor Stadium', 'ucsc', 'fom', now(), 'live', 'Live - 3rd Quarter', 'text-yellow-400', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.fixtures
  WHERE sport_id='basketball' AND team1_faculty_id='ucsc' AND team2_faculty_id='fom' AND status='live'
);

-- ---------- Today Schedule (from src/data/homeData.ts todaySchedule) ----------
-- Uses CURRENT_DATE for event_date
INSERT INTO public.scheduled_events (event_date, sport_id, sport_label, time_range, venue)
SELECT CURRENT_DATE, 'football', 'Football', '4:30 PM', 'Main Field'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=CURRENT_DATE AND sport_label='Football' AND time_range='4:30 PM');

INSERT INTO public.scheduled_events (event_date, sport_id, sport_label, time_range, venue)
SELECT CURRENT_DATE, 'volleyball', 'Volleyball', '5:00 PM', 'Volleyball Court A'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=CURRENT_DATE AND sport_label='Volleyball' AND time_range='5:00 PM');

INSERT INTO public.scheduled_events (event_date, sport_id, sport_label, time_range, venue)
SELECT CURRENT_DATE, 'badminton', 'Badminton', '6:00 PM', 'Indoor Stadium Hall 2'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=CURRENT_DATE AND sport_label='Badminton' AND time_range='6:00 PM');

-- ---------- Lineup calendar (from src/data/lineupData.ts) ----------
-- We store entries as generic scheduled_events for their dates
-- Helper: a short function to insert safely (optional, inline pattern used instead)
-- November 21, 2025
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('November 21, 2025','Month DD, YYYY'), 'Athletics (Track & Field)', '8:00 AM - 12:00 PM', 'University Ground'
WHERE NOT EXISTS (
  SELECT 1 FROM public.scheduled_events
  WHERE event_date=to_date('November 21, 2025','Month DD, YYYY') AND sport_label='Athletics (Track & Field)' AND time_range='8:00 AM - 12:00 PM'
);
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('November 21, 2025','Month DD, YYYY'), 'Cricket (Men''s & Women''s)', '2:00 PM - 6:00 PM', 'Cricket Ground'
WHERE NOT EXISTS (
  SELECT 1 FROM public.scheduled_events
  WHERE event_date=to_date('November 21, 2025','Month DD, YYYY') AND sport_label='Cricket (Men''s & Women''s)' AND time_range='2:00 PM - 6:00 PM'
);

-- November 22, 2025
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('November 22, 2025','Month DD, YYYY'), 'Football (Men''s)', '9:00 AM - 1:00 PM', 'Main Field'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('November 22, 2025','Month DD, YYYY') AND sport_label='Football (Men''s)' AND time_range='9:00 AM - 1:00 PM');
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('November 22, 2025','Month DD, YYYY'), 'Netball (Women''s)', '2:00 PM - 5:00 PM', 'Netball Court'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('November 22, 2025','Month DD, YYYY') AND sport_label='Netball (Women''s)' AND time_range='2:00 PM - 5:00 PM');

-- November 23, 2025
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('November 23, 2025','Month DD, YYYY'), 'Basketball (Men''s & Women''s)', '8:00 AM - 12:00 PM', 'Indoor Stadium'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('November 23, 2025','Month DD, YYYY') AND sport_label='Basketball (Men''s & Women''s)' AND time_range='8:00 AM - 12:00 PM');
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('November 23, 2025','Month DD, YYYY'), 'Volleyball (Men''s & Women''s)', '2:00 PM - 6:00 PM', 'Volleyball Court'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('November 23, 2025','Month DD, YYYY') AND sport_label='Volleyball (Men''s & Women''s)' AND time_range='2:00 PM - 6:00 PM');

-- November 24, 2025
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('November 24, 2025','Month DD, YYYY'), 'Badminton (Singles)', '9:00 AM - 1:00 PM', 'Indoor Stadium Hall 2'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('November 24, 2025','Month DD, YYYY') AND sport_label='Badminton (Singles)' AND time_range='9:00 AM - 1:00 PM');
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('November 24, 2025','Month DD, YYYY'), 'Table Tennis (Singles)', '2:00 PM - 6:00 PM', 'Sports Complex'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('November 24, 2025','Month DD, YYYY') AND sport_label='Table Tennis (Singles)' AND time_range='2:00 PM - 6:00 PM');

-- November 25, 2025
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('November 25, 2025','Month DD, YYYY'), 'Chess', '10:00 AM - 4:00 PM', 'Student Center Hall'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('November 25, 2025','Month DD, YYYY') AND sport_label='Chess' AND time_range='10:00 AM - 4:00 PM');
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('November 25, 2025','Month DD, YYYY'), 'Carrom', '10:00 AM - 4:00 PM', 'Recreation Room'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('November 25, 2025','Month DD, YYYY') AND sport_label='Carrom' AND time_range='10:00 AM - 4:00 PM');

-- November 26, 2025
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('November 26, 2025','Month DD, YYYY'), 'Swimming', '8:00 AM - 12:00 PM', 'University Pool'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('November 26, 2025','Month DD, YYYY') AND sport_label='Swimming' AND time_range='8:00 AM - 12:00 PM');
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('November 26, 2025','Month DD, YYYY'), 'Water Polo', '2:00 PM - 5:00 PM', 'University Pool'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('November 26, 2025','Month DD, YYYY') AND sport_label='Water Polo' AND time_range='2:00 PM - 5:00 PM');

-- November 27, 2025
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('November 27, 2025','Month DD, YYYY'), 'Hockey (Men''s)', '9:00 AM - 1:00 PM', 'Hockey Field'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('November 27, 2025','Month DD, YYYY') AND sport_label='Hockey (Men''s)' AND time_range='9:00 AM - 1:00 PM');
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('November 27, 2025','Month DD, YYYY'), 'Rugby (Men''s)', '2:00 PM - 6:00 PM', 'Rugby Ground'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('November 27, 2025','Month DD, YYYY') AND sport_label='Rugby (Men''s)' AND time_range='2:00 PM - 6:00 PM');

-- November 28, 2025
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('November 28, 2025','Month DD, YYYY'), 'Tennis (Singles)', '8:00 AM - 12:00 PM', 'Tennis Courts'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('November 28, 2025','Month DD, YYYY') AND sport_label='Tennis (Singles)' AND time_range='8:00 AM - 12:00 PM');
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('November 28, 2025','Month DD, YYYY'), 'Squash', '2:00 PM - 6:00 PM', 'Squash Courts'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('November 28, 2025','Month DD, YYYY') AND sport_label='Squash' AND time_range='2:00 PM - 6:00 PM');

-- November 29, 2025
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('November 29, 2025','Month DD, YYYY'), 'Badminton (Doubles)', '9:00 AM - 1:00 PM', 'Indoor Stadium Hall 2'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('November 29, 2025','Month DD, YYYY') AND sport_label='Badminton (Doubles)' AND time_range='9:00 AM - 1:00 PM');
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('November 29, 2025','Month DD, YYYY'), 'Table Tennis (Doubles)', '2:00 PM - 6:00 PM', 'Sports Complex'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('November 29, 2025','Month DD, YYYY') AND sport_label='Table Tennis (Doubles)' AND time_range='2:00 PM - 6:00 PM');

-- November 30, 2025
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('November 30, 2025','Month DD, YYYY'), 'Football (Women''s)', '9:00 AM - 1:00 PM', 'Main Field'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('November 30, 2025','Month DD, YYYY') AND sport_label='Football (Women''s)' AND time_range='9:00 AM - 1:00 PM');
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('November 30, 2025','Month DD, YYYY'), 'Elle (Traditional)', '2:00 PM - 5:00 PM', 'Elle Ground'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('November 30, 2025','Month DD, YYYY') AND sport_label='Elle (Traditional)' AND time_range='2:00 PM - 5:00 PM');

-- December 1, 2025
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('December 1, 2025','Month DD, YYYY'), 'Basketball Semi-Finals', '10:00 AM - 2:00 PM', 'Indoor Stadium'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('December 1, 2025','Month DD, YYYY') AND sport_label='Basketball Semi-Finals' AND time_range='10:00 AM - 2:00 PM');
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('December 1, 2025','Month DD, YYYY'), 'Volleyball Semi-Finals', '3:00 PM - 7:00 PM', 'Volleyball Court'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('December 1, 2025','Month DD, YYYY') AND sport_label='Volleyball Semi-Finals' AND time_range='3:00 PM - 7:00 PM');

-- December 2, 2025
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('December 2, 2025','Month DD, YYYY'), 'Cricket Semi-Finals', '9:00 AM - 5:00 PM', 'Cricket Ground'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('December 2, 2025','Month DD, YYYY') AND sport_label='Cricket Semi-Finals' AND time_range='9:00 AM - 5:00 PM');
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('December 2, 2025','Month DD, YYYY'), 'Football Semi-Finals', '2:00 PM - 6:00 PM', 'Main Field'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('December 2, 2025','Month DD, YYYY') AND sport_label='Football Semi-Finals' AND time_range='2:00 PM - 6:00 PM');

-- December 3, 2025
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('December 3, 2025','Month DD, YYYY'), 'Tennis Finals', '9:00 AM - 12:00 PM', 'Tennis Courts'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('December 3, 2025','Month DD, YYYY') AND sport_label='Tennis Finals' AND time_range='9:00 AM - 12:00 PM');
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('December 3, 2025','Month DD, YYYY'), 'Badminton Finals', '2:00 PM - 6:00 PM', 'Indoor Stadium Hall 2'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('December 3, 2025','Month DD, YYYY') AND sport_label='Badminton Finals' AND time_range='2:00 PM - 6:00 PM');

-- December 4, 2025
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('December 4, 2025','Month DD, YYYY'), 'Track & Field Finals', '8:00 AM - 2:00 PM', 'University Ground'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('December 4, 2025','Month DD, YYYY') AND sport_label='Track & Field Finals' AND time_range='8:00 AM - 2:00 PM');
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('December 4, 2025','Month DD, YYYY'), 'Swimming Finals', '3:00 PM - 6:00 PM', 'University Pool'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('December 4, 2025','Month DD, YYYY') AND sport_label='Swimming Finals' AND time_range='3:00 PM - 6:00 PM');

-- December 5, 2025
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('December 5, 2025','Month DD, YYYY'), 'Basketball Finals', '10:00 AM - 1:00 PM', 'Indoor Stadium'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('December 5, 2025','Month DD, YYYY') AND sport_label='Basketball Finals' AND time_range='10:00 AM - 1:00 PM');
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('December 5, 2025','Month DD, YYYY'), 'Volleyball Finals', '3:00 PM - 6:00 PM', 'Volleyball Court'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('December 5, 2025','Month DD, YYYY') AND sport_label='Volleyball Finals' AND time_range='3:00 PM - 6:00 PM');

-- December 9, 2025
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('December 9, 2025','Month DD, YYYY'), 'Cricket Finals', '9:00 AM - 5:00 PM', 'Cricket Ground'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('December 9, 2025','Month DD, YYYY') AND sport_label='Cricket Finals' AND time_range='9:00 AM - 5:00 PM');
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('December 9, 2025','Month DD, YYYY'), 'Football Finals', '2:00 PM - 5:00 PM', 'Main Field'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('December 9, 2025','Month DD, YYYY') AND sport_label='Football Finals' AND time_range='2:00 PM - 5:00 PM');
INSERT INTO public.scheduled_events (event_date, sport_label, time_range, venue)
SELECT to_date('December 9, 2025','Month DD, YYYY'), 'Closing Ceremony', '6:00 PM - 9:00 PM', 'Main Auditorium'
WHERE NOT EXISTS (SELECT 1 FROM public.scheduled_events WHERE event_date=to_date('December 9, 2025','Month DD, YYYY') AND sport_label='Closing Ceremony' AND time_range='6:00 PM - 9:00 PM');

-- ---------- Sample Results (so Results page has real rows) ----------
-- 1) Athletics - 100m Sprint (Men's)
DO $$
DECLARE rid bigint;
BEGIN
  SELECT id INTO rid FROM public.results
  WHERE sport_id='athletics' AND event='100m Sprint' AND gender='Men''s' AND event_date='2025-10-27' AND event_time='15:30:00';
  IF rid IS NULL THEN
    INSERT INTO public.results (sport_id, event, category, gender, event_date, event_time)
    VALUES ('athletics','100m Sprint','Athletics','Men''s','2025-10-27','15:30:00')
    RETURNING id INTO rid;
  END IF;

  INSERT INTO public.result_positions (result_id, place, faculty_id) VALUES
    (rid,1,'fos'),
    (rid,2,'ucsc'),
    (rid,3,'foa'),
    (rid,4,'fom'),
    (rid,5,'fmf')
  ON CONFLICT (result_id, place) DO NOTHING;
END $$;

-- 2) Badminton - Singles Final (Men's)
DO $$
DECLARE rid bigint;
BEGIN
  SELECT id INTO rid FROM public.results
  WHERE sport_id='badminton' AND event='Singles Final' AND gender='Men''s' AND event_date='2025-10-26' AND event_time='13:00:00';
  IF rid IS NULL THEN
    INSERT INTO public.results (sport_id, event, category, gender, event_date, event_time)
    VALUES ('badminton','Singles Final','Individual Sport','Men''s','2025-10-26','13:00:00')
    RETURNING id INTO rid;
  END IF;

  INSERT INTO public.result_positions (result_id, place, faculty_id) VALUES
    (rid,1,'ucsc'),
    (rid,2,'foa'),
    (rid,3,'fom'),
    (rid,4,'fos')
  ON CONFLICT (result_id, place) DO NOTHING;
END $$;

-- 3) Cricket - Championship Standings (Men's)
DO $$
DECLARE rid bigint;
BEGIN
  SELECT id INTO rid FROM public.results
  WHERE sport_id='cricket' AND event='Championship Standings' AND gender='Men''s' AND event_date='2025-10-27' AND event_time='10:00:00';
  IF rid IS NULL THEN
    INSERT INTO public.results (sport_id, event, category, gender, event_date, event_time)
    VALUES ('cricket','Championship Standings','Team Sport','Men''s','2025-10-27','10:00:00')
    RETURNING id INTO rid;
  END IF;

  INSERT INTO public.result_positions (result_id, place, faculty_id) VALUES
    (rid,1,'fol'),
    (rid,2,'fmf'),
    (rid,3,'fos'),
    (rid,4,'ucsc'),
    (rid,5,'foa'),
    (rid,6,'fom'),
    (rid,7,'foe'),
    (rid,8,'fot')
  ON CONFLICT (result_id, place) DO NOTHING;
END $$;

COMMIT;