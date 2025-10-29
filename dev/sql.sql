-- Freshers Tournament Database Schema (Supabase/Postgres)
-- Maps the current frontend TS data shapes to normalized tables
-- Safe to run on a fresh database. If re-running, be aware of DROP TYPE ... CASCADE below.

-- ==========================================
-- Enums
-- ==========================================
DO $$ BEGIN
	PERFORM 1 FROM pg_type WHERE typname = 'sport_category';
	IF NOT FOUND THEN
		CREATE TYPE sport_category AS ENUM ('Team Sport','Individual Sport','Athletics','Swimming');
	END IF;
END $$;

DO $$ BEGIN
	PERFORM 1 FROM pg_type WHERE typname = 'sport_gender';
	IF NOT FOUND THEN
		CREATE TYPE sport_gender AS ENUM ('Mens','Womens','Both');
	END IF;
END $$;

DO $$ BEGIN
	PERFORM 1 FROM pg_type WHERE typname = 'match_status';
	IF NOT FOUND THEN
		CREATE TYPE match_status AS ENUM ('scheduled','live','completed','delayed','cancelled');
	END IF;
END $$;

DO $$ BEGIN
	PERFORM 1 FROM pg_type WHERE typname = 'bracket_round';
	IF NOT FOUND THEN
		CREATE TYPE bracket_round AS ENUM ('round_of_16','quarter_final','semi_final','final');
	END IF;
END $$;


-- ==========================================
-- Core reference tables
-- ==========================================
CREATE TABLE IF NOT EXISTS public.sports (
	id           text PRIMARY KEY,            -- e.g. 'cricket', 'football'
	name         text NOT NULL,               -- Display name
	category     sport_category NOT NULL,     -- Matches sportsData.ts categories
	gender       sport_gender NOT NULL DEFAULT 'Both', -- 'Mens' | 'Womens' | 'Both'
	created_at   timestamptz NOT NULL DEFAULT now(),
	UNIQUE(name)
);

CREATE TABLE IF NOT EXISTS public.faculties (
	id              text PRIMARY KEY,                    -- e.g. 'foa', 'ucsc'
	name            text NOT NULL,                       -- Full name
	short_name      text NOT NULL,                       -- e.g. 'FOA', 'UCSC'
	primary_color   text NOT NULL CHECK (primary_color ~ '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'),
	secondary_color text NOT NULL CHECK (secondary_color ~ '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'),
	logo_url        text NOT NULL,                       -- e.g. '/logos/faculties/arts.png' (Supabase storage URL recommended in prod)
	created_at      timestamptz NOT NULL DEFAULT now(),
	UNIQUE(short_name),
	UNIQUE(name)
);

-- Faculties x Sports participation (many-to-many)
CREATE TABLE IF NOT EXISTS public.faculty_sports (
	faculty_id  text NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
	sport_id    text NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
	PRIMARY KEY (faculty_id, sport_id)
);

-- Achievements per faculty per sport
CREATE TABLE IF NOT EXISTS public.faculty_achievements (
	id          bigserial PRIMARY KEY,
	faculty_id  text NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
	sport_id    text REFERENCES public.sports(id) ON DELETE SET NULL,
	position    text NOT NULL,        -- e.g. 'Champions', 'Runner-up', 'Semi-finalists'
	year        int CHECK (year IS NULL OR (year BETWEEN 1900 AND 2100)),
	created_at  timestamptz NOT NULL DEFAULT now()
);

-- Team members per faculty (optionally tied to a sport)
CREATE TABLE IF NOT EXISTS public.faculty_team_members (
	id          bigserial PRIMARY KEY,
	faculty_id  text NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
	name        text NOT NULL,
	role        text NOT NULL,        -- e.g. 'Captain', 'Vice Captain'
	sport_id    text REFERENCES public.sports(id) ON DELETE SET NULL,
	created_at  timestamptz NOT NULL DEFAULT now()
);


-- ==========================================
-- Points and Leaderboard
-- ==========================================
-- Separate table so totals can be computed/updated without touching faculty metadata
CREATE TABLE IF NOT EXISTS public.faculty_points (
	faculty_id    text PRIMARY KEY REFERENCES public.faculties(id) ON DELETE CASCADE,
	mens_points   int NOT NULL DEFAULT 0,
	womens_points int NOT NULL DEFAULT 0,
	total_points  int GENERATED ALWAYS AS (COALESCE(mens_points,0) + COALESCE(womens_points,0)) STORED,
	rank_position int, -- Optional manual override if needed; otherwise use the leaderboard view
	updated_at    timestamptz NOT NULL DEFAULT now()
);

-- View that mirrors src/data/leaderboardData.ts shape
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


-- ==========================================
-- Scheduling and Fixtures
-- ==========================================
-- General scheduled events (used for lineupData.ts day+events UI)
CREATE TABLE IF NOT EXISTS public.scheduled_events (
	id           bigserial PRIMARY KEY,
	event_date   date NOT NULL,                     -- e.g. '2025-11-21'
	sport_id     text REFERENCES public.sports(id) ON DELETE SET NULL,
	sport_label  text,                              -- free-text when label differs (e.g. 'Athletics (Track & Field)')
	time_range   text,                              -- e.g. '8:00 AM - 12:00 PM'
	start_time   time,                              -- optional normalized times
	end_time     time,
	venue        text NOT NULL,
	created_at   timestamptz NOT NULL DEFAULT now()
);

-- Match fixtures (covers todaySchedule + liveMatches + completed results metadata)
CREATE TABLE IF NOT EXISTS public.fixtures (
	id                 bigserial PRIMARY KEY,
	sport_id           text NOT NULL REFERENCES public.sports(id) ON DELETE RESTRICT,
	venue              text NOT NULL,
	team1_faculty_id   text NOT NULL REFERENCES public.faculties(id) ON DELETE RESTRICT,
	team2_faculty_id   text NOT NULL REFERENCES public.faculties(id) ON DELETE RESTRICT,
	scheduled_at       timestamptz NOT NULL,         -- date + time
	status             match_status NOT NULL DEFAULT 'scheduled',
	status_text        text,                          -- e.g. 'Live - 2nd Innings'
	status_color       text,                          -- e.g. 'text-green-400'
	round_name         text,                          -- e.g. 'Semi Final', 'Quarter Final'
	team1_score        text,                          -- flexible to handle different sports
	team2_score        text,
	winner_faculty_id  text REFERENCES public.faculties(id) ON DELETE SET NULL,
	created_at         timestamptz NOT NULL DEFAULT now(),
	CHECK (team1_faculty_id <> team2_faculty_id)
);

-- View that mirrors src/data/homeData.ts LiveMatch[] shape
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


-- ==========================================
-- Results (Completed Events)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.results (
	id           bigserial PRIMARY KEY,
	sport_id     text NOT NULL REFERENCES public.sports(id) ON DELETE RESTRICT,
	event        text,                                 -- e.g. '100m Sprint', 'Singles Final'
	category     sport_category NOT NULL,              -- 'Team Sport' | 'Individual Sport' | 'Athletics' | 'Swimming'
	gender       text NOT NULL CHECK (gender IN ('Men''s','Women''s','Mixed')),
	event_date   date NOT NULL,
	event_time   time NOT NULL,
	created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.result_positions (
	result_id   bigint NOT NULL REFERENCES public.results(id) ON DELETE CASCADE,
	place       int NOT NULL CHECK (place > 0),        -- 1,2,3,...
	faculty_id  text NOT NULL REFERENCES public.faculties(id) ON DELETE RESTRICT,
	PRIMARY KEY (result_id, place)
);

-- Aggregated view that matches src/data/resultsData.ts CompletedEvent shape
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
			LEFT JOIN public.faculties f ON f.id = rp.faculty_id
			WHERE rp.result_id = r.id
		), '[]'::jsonb
	) AS positions
FROM public.results r
JOIN public.sports s ON s.id = r.sport_id;


-- ==========================================
-- Tournament Draw / Brackets (tournamentData.ts)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.tournaments (
	id          bigserial PRIMARY KEY,
	sport_id    text NOT NULL REFERENCES public.sports(id) ON DELETE RESTRICT,
	name        text NOT NULL,          -- e.g. 'Cricket Tournament 2025'
	event_date  date,                   -- date shown for finals/day
	venue       text,
	created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tournament_rounds (
	id            bigserial PRIMARY KEY,
	tournament_id bigint NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
	round_name    bracket_round NOT NULL,         -- 'quarter_final', 'semi_final', 'final', etc.
	round_order   int NOT NULL,                   -- 1..N ordering within tournament
	UNIQUE (tournament_id, round_name),
	UNIQUE (tournament_id, round_order)
);

CREATE TABLE IF NOT EXISTS public.tournament_matches (
	id                   bigserial PRIMARY KEY,
	tournament_id        bigint NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
	round_id             bigint NOT NULL REFERENCES public.tournament_rounds(id) ON DELETE CASCADE,
	match_order          int NOT NULL,                        -- order within a round
	team_a_faculty_id    text REFERENCES public.faculties(id) ON DELETE SET NULL,
	team_b_faculty_id    text REFERENCES public.faculties(id) ON DELETE SET NULL,
	score_a              text,
	score_b              text,
	winner_faculty_id    text REFERENCES public.faculties(id) ON DELETE SET NULL,
	created_at           timestamptz NOT NULL DEFAULT now(),
	UNIQUE (round_id, match_order)
);


-- ==========================================
-- Indexes
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_faculty_sports_sport ON public.faculty_sports (sport_id);
CREATE INDEX IF NOT EXISTS idx_faculty_achievements_fac_sport ON public.faculty_achievements (faculty_id, sport_id);
CREATE INDEX IF NOT EXISTS idx_faculty_team_members_fac ON public.faculty_team_members (faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_points_total ON public.faculty_points (total_points DESC);
CREATE INDEX IF NOT EXISTS idx_fixtures_sport_time ON public.fixtures (sport_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_events_date ON public.scheduled_events (event_date);
CREATE INDEX IF NOT EXISTS idx_rounds_tournament_order ON public.tournament_rounds (tournament_id, round_order);
CREATE INDEX IF NOT EXISTS idx_matches_round_order ON public.tournament_matches (round_id, match_order);
CREATE INDEX IF NOT EXISTS idx_results_date_time ON public.results (event_date DESC, event_time DESC);
CREATE INDEX IF NOT EXISTS idx_result_positions_result ON public.result_positions (result_id);


-- ==========================================
-- Supabase Row Level Security (RLS) - Public Read
-- Enable RLS and allow read-only access for anon and authenticated roles
-- ==========================================
ALTER TABLE public.sports                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculties             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_sports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_achievements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_team_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_points        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixtures              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_rounds     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_positions      ENABLE ROW LEVEL SECURITY;

-- Helper to create identical read policies for a table
DO $$
DECLARE tbl text;
DECLARE pol text;
BEGIN
	FOREACH tbl IN ARRAY ARRAY[
		'sports', 'faculties', 'faculty_sports', 'faculty_achievements', 'faculty_team_members',
		'faculty_points', 'scheduled_events', 'fixtures', 'tournaments', 'tournament_rounds', 'tournament_matches',
		'results', 'result_positions'
	] LOOP
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


-- ==========================================
-- Notes / Mapping to Frontend Types
-- ==========================================
-- facultiesData.ts -> faculties, faculty_sports, faculty_achievements, faculty_team_members
--   - Faculty.totalPoints/position can be sourced from faculty_points and leaderboard view
-- sportsData.ts    -> sports
-- leaderboardData.ts -> leaderboard view (rank, name, code, mensPoints, womensPoints, totalPoints)
-- homeData.ts      -> fixtures (status/status_color) and live_matches view; todaySchedule -> fixtures with status='scheduled' and round_name
-- lineupData.ts    -> scheduled_events (date + events with sport_label/time_range/venue)
-- tournamentData.ts -> tournaments, tournament_rounds, tournament_matches

