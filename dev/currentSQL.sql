
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

CREATE TABLE IF NOT EXISTS public.faculty_sports (
	faculty_id  text NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
	sport_id    text NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
	PRIMARY KEY (faculty_id, sport_id)
);

CREATE TABLE IF NOT EXISTS public.faculty_achievements (
	id          bigserial PRIMARY KEY,
	faculty_id  text NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
	sport_id    text REFERENCES public.sports(id) ON DELETE SET NULL,
	position    text NOT NULL,        -- e.g. 'Champions', 'Runner-up', 'Semi-finalists'
	year        int CHECK (year IS NULL OR (year BETWEEN 1900 AND 2100)),
	created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.faculty_team_members (
	id          bigserial PRIMARY KEY,
	faculty_id  text NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
	name        text NOT NULL,
	role        text NOT NULL,        -- e.g. 'Captain', 'Vice Captain'
	sport_id    text REFERENCES public.sports(id) ON DELETE SET NULL,
	created_at  timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS public.faculty_points (
	faculty_id    text PRIMARY KEY REFERENCES public.faculties(id) ON DELETE CASCADE,
	mens_points   int NOT NULL DEFAULT 0,
	womens_points int NOT NULL DEFAULT 0,
	total_points  int GENERATED ALWAYS AS (COALESCE(mens_points,0) + COALESCE(womens_points,0)) STORED,
	rank_position int, -- Optional manual override if needed; otherwise use the leaderboard view
	updated_at    timestamptz NOT NULL DEFAULT now()
);

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


CREATE INDEX IF NOT EXISTS idx_faculty_sports_sport ON public.faculty_sports (sport_id);
CREATE INDEX IF NOT EXISTS idx_faculty_achievements_fac_sport ON public.faculty_achievements (faculty_id, sport_id);
CREATE INDEX IF NOT EXISTS idx_faculty_team_members_fac ON public.faculty_team_members (faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_points_total ON public.faculty_points (total_points DESC);
CREATE INDEX IF NOT EXISTS idx_fixtures_sport_time ON public.fixtures (sport_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_events_date ON public.scheduled_events (event_date);
CREATE INDEX IF NOT EXISTS idx_results_date_time ON public.results (event_date DESC, event_time DESC);
CREATE INDEX IF NOT EXISTS idx_result_positions_result ON public.result_positions (result_id);


ALTER TABLE public.sports                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculties             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_sports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_achievements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_team_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_points        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixtures              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_positions      ENABLE ROW LEVEL SECURITY;

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


alter table public.scheduled_events enable row level security;
create policy "scheduled_events_select_public"
on public.scheduled_events
for select
to anon, authenticated
using (true);

create policy "scheduled_events_insert_admins"
on public.scheduled_events
for insert
to authenticated
with check (
  exists (
    select 1 from public.admin_users au
    where au.email = auth.email()
      and au.is_active = true
  )
);

create policy "scheduled_events_update_admins"
on public.scheduled_events
for update
to authenticated
using (
  exists (
    select 1 from public.admin_users au
    where au.email = auth.email()
      and au.is_active = true
  )
)
with check (
  exists (
    select 1 from public.admin_users au
    where au.email = auth.email()
      and au.is_active = true
  )
);

create policy "scheduled_events_delete_admins"
on public.scheduled_events
for delete
to authenticated
using (
  exists (
    select 1 from public.admin_users au
    where au.email = auth.email()
      and au.is_active = true
  )
);

insert into public.admin_users (email, is_active)
values ('your-admin@email.com', true)
on conflict (email) do update
set is_active = excluded.is_active;



alter table public.sports enable row level security;
create policy "sports_select_public"
on public.sports
for select
to anon, authenticated
using (true);
create policy "sports_insert_admins"
on public.sports
for insert
to authenticated
with check (
  exists (
    select 1 from public.admin_users au
    where au.email = auth.email()
      and au.is_active = true
  )
);

create policy "sports_update_admins"
on public.sports
for update
to authenticated
using (
  exists (
    select 1 from public.admin_users au
    where au.email = auth.email()
      and au.is_active = true
  )
)
with check (
  exists (
    select 1 from public.admin_users au
    where au.email = auth.email()
      and au.is_active = true
  )
);

create policy "sports_delete_admins"
on public.sports
for delete
to authenticated
using (
  exists (
    select 1 from public.admin_users au
    where au.email = auth.email()
      and au.is_active = true
  )
);
insert into public.admin_users (email, is_active)
values ('YOUR_ADMIN_EMAIL', true)
on conflict (email) do update set is_active = excluded.is_active;


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
  wf.name AS winner_name
FROM public.live_series_matches m
JOIN public.live_sport_series lss ON lss.id = m.series_id
JOIN public.sports s ON s.id = lss.sport_id
JOIN public.faculties f1 ON f1.id = m.faculty1_id
JOIN public.faculties f2 ON f2.id = m.faculty2_id
LEFT JOIN public.faculties wf ON wf.id = m.winner_faculty_id
WHERE m.status = 'live' AND m.is_finished = false;

ALTER TABLE public.live_sport_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_series_matches ENABLE ROW LEVEL SECURITY;

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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
    CREATE TYPE gender_type AS ENUM ('male','female','mixed');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='live_sport_series' AND column_name='gender'
  ) THEN
    ALTER TABLE public.live_sport_series ADD COLUMN gender gender_type NOT NULL DEFAULT 'male';
  END IF;
END $$;

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

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='live_series_matches' AND column_name='commentary'
  ) THEN
    ALTER TABLE public.live_series_matches ADD COLUMN commentary text;
  END IF;
END $$;

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
CREATE TABLE IF NOT EXISTS public.admin_users (
  email        text PRIMARY KEY,
  display_name text,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_users' AND policyname='admin_users_read_public'
  ) THEN
    CREATE POLICY admin_users_read_public ON public.admin_users FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

INSERT INTO public.admin_users (email, display_name, is_active)
VALUES
  ('admin@example.com','Admin User', true)
ON CONFLICT (email) DO UPDATE SET display_name=EXCLUDED.display_name, is_active=EXCLUDED.is_active;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS(SELECT 1 FROM public.admin_users au WHERE au.email = auth.email() AND au.is_active = true);
$$ LANGUAGE sql STABLE;

DO $$
BEGIN
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
CREATE TABLE IF NOT EXISTS public.admin_users (
  email        text PRIMARY KEY,
  display_name text,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_users' AND policyname='admin_users_read_public'
  ) THEN
    CREATE POLICY admin_users_read_public ON public.admin_users FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS(SELECT 1 FROM public.admin_users au WHERE au.email = auth.email() AND au.is_active = true);
$$ LANGUAGE sql STABLE;

-- Helper: enable RLS and create read policy if missing
DO $$
DECLARE tbl text;
DECLARE pol text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'sports','faculties','faculty_sports','faculty_achievements','faculty_team_members',
    'faculty_points','scheduled_events','fixtures','results','result_positions',
    'live_sport_series','live_series_matches'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    pol := 'read_anon_' || tbl;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=tbl AND policyname=pol
    ) THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO anon USING (true);', pol, tbl);
    END IF;
    pol := 'read_auth_' || tbl;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=tbl AND policyname=pol
    ) THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true);', pol, tbl);
    END IF;
  END LOOP;
END $$;

-- 1) Core admin writes: sports and scheduled_events
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sports' AND policyname='sports_insert_admin') THEN
    CREATE POLICY sports_insert_admin ON public.sports FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sports' AND policyname='sports_update_admin') THEN
    CREATE POLICY sports_update_admin ON public.sports FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sports' AND policyname='sports_delete_admin') THEN
    CREATE POLICY sports_delete_admin ON public.sports FOR DELETE TO authenticated USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='scheduled_events' AND policyname='scheduled_events_insert_admin') THEN
    CREATE POLICY scheduled_events_insert_admin ON public.scheduled_events FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='scheduled_events' AND policyname='scheduled_events_update_admin') THEN
    CREATE POLICY scheduled_events_update_admin ON public.scheduled_events FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='scheduled_events' AND policyname='scheduled_events_delete_admin') THEN
    CREATE POLICY scheduled_events_delete_admin ON public.scheduled_events FOR DELETE TO authenticated USING (public.is_admin());
  END IF;
END $$;

-- 2) Live results writes (series + matches)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='live_sport_series' AND policyname='lss_insert_admin') THEN
    CREATE POLICY lss_insert_admin ON public.live_sport_series FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='live_sport_series' AND policyname='lss_update_admin') THEN
    CREATE POLICY lss_update_admin ON public.live_sport_series FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='live_sport_series' AND policyname='lss_delete_admin') THEN
    CREATE POLICY lss_delete_admin ON public.live_sport_series FOR DELETE TO authenticated USING (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='live_series_matches' AND policyname='lsm_insert_admin') THEN
    CREATE POLICY lsm_insert_admin ON public.live_series_matches FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='live_series_matches' AND policyname='lsm_update_admin') THEN
    CREATE POLICY lsm_update_admin ON public.live_series_matches FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='live_series_matches' AND policyname='lsm_delete_admin') THEN
    CREATE POLICY lsm_delete_admin ON public.live_series_matches FOR DELETE TO authenticated USING (public.is_admin());
  END IF;
END $$;

-- 3) Results and points writes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='results' AND policyname='results_insert_admin') THEN
    CREATE POLICY results_insert_admin ON public.results FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='results' AND policyname='results_update_admin') THEN
    CREATE POLICY results_update_admin ON public.results FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='results' AND policyname='results_delete_admin') THEN
    CREATE POLICY results_delete_admin ON public.results FOR DELETE TO authenticated USING (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='result_positions' AND policyname='result_positions_insert_admin') THEN
    CREATE POLICY result_positions_insert_admin ON public.result_positions FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='result_positions' AND policyname='result_positions_update_admin') THEN
    CREATE POLICY result_positions_update_admin ON public.result_positions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='result_positions' AND policyname='result_positions_delete_admin') THEN
    CREATE POLICY result_positions_delete_admin ON public.result_positions FOR DELETE TO authenticated USING (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_points' AND policyname='faculty_points_insert_admin') THEN
    CREATE POLICY faculty_points_insert_admin ON public.faculty_points FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_points' AND policyname='faculty_points_update_admin') THEN
    CREATE POLICY faculty_points_update_admin ON public.faculty_points FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

-- 4) Cascade helpers: allow admin writes on ref tables used by cascade tools
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_sports' AND policyname='faculty_sports_write_admin') THEN
    CREATE POLICY faculty_sports_write_admin ON public.faculty_sports FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_sports' AND policyname='faculty_sports_update_admin') THEN
    CREATE POLICY faculty_sports_update_admin ON public.faculty_sports FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_sports' AND policyname='faculty_sports_delete_admin') THEN
    CREATE POLICY faculty_sports_delete_admin ON public.faculty_sports FOR DELETE TO authenticated USING (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_achievements' AND policyname='faculty_achievements_insert_admin') THEN
    CREATE POLICY faculty_achievements_insert_admin ON public.faculty_achievements FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_achievements' AND policyname='faculty_achievements_update_admin') THEN
    CREATE POLICY faculty_achievements_update_admin ON public.faculty_achievements FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_achievements' AND policyname='faculty_achievements_delete_admin') THEN
    CREATE POLICY faculty_achievements_delete_admin ON public.faculty_achievements FOR DELETE TO authenticated USING (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_team_members' AND policyname='faculty_team_members_insert_admin') THEN
    CREATE POLICY faculty_team_members_insert_admin ON public.faculty_team_members FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_team_members' AND policyname='faculty_team_members_update_admin') THEN
    CREATE POLICY faculty_team_members_update_admin ON public.faculty_team_members FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='faculty_team_members' AND policyname='faculty_team_members_delete_admin') THEN
    CREATE POLICY faculty_team_members_delete_admin ON public.faculty_team_members FOR DELETE TO authenticated USING (public.is_admin());
  END IF;
END $$;

-- 5) (Optional) fixtures writes if you plan to manage legacy live fixtures from UI
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fixtures' AND policyname='fixtures_insert_admin') THEN
    CREATE POLICY fixtures_insert_admin ON public.fixtures FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fixtures' AND policyname='fixtures_update_admin') THEN
    CREATE POLICY fixtures_update_admin ON public.fixtures FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fixtures' AND policyname='fixtures_delete_admin') THEN
    CREATE POLICY fixtures_delete_admin ON public.fixtures FOR DELETE TO authenticated USING (public.is_admin());
  END IF;
END $$;
