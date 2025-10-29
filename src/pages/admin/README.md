# Admin Dashboard (Frontend)

This document explains the Admin Dashboard prototype included in the frontend.

Location
- Component: `src/pages/admin/AdminDashboard.tsx`
- Route (dev): `/admin`

Purpose
- The Admin Dashboard included here is a lightweight prototype to manage site-level configuration and view a sports grid for quick management actions.
- It is intended as a UI scaffold; it does not include secure authentication or server-side protections.

Local (mock) credentials
- Username: `admin`
- Password: `admin123`

These credentials are used only for the prototype UI and are stored in local component state. Replace this flow with a proper authentication method (Supabase Auth, OAuth, or a secure backend) before deploying.

Notes for developers
- To change the admin UI, edit `src/pages/admin/AdminDashboard.tsx`.
- The SQL schema for the backend is available at `dev/sql.sql` — use it to map frontend shapes to tables (faculties, sports, fixtures, results, leaderboard views).
- If you add backend endpoints for admin actions, protect them with proper auth and consider adding server-side validation.
- Consider adding a route guard (private route) in `src/App.tsx` so `/admin` cannot be accessed without authentication.

Recent additions
- New admin pages and routes:
	- `/admin/faculties` — manage faculties (add name, short code, colors and logo upload)
	- `/admin/sports` — manage sports (id, name, category) — now supports `gender` applicability: `Mens`, `Womens`, or `Both`
	- `/admin/lineup` — manage scheduled events (date, sport or sport label, time range or start/end times, venue)

How to enable full CRUD
- To persist changes you must configure Supabase in `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The frontend uses `src/lib/supabaseClient.ts` and `src/lib/api.ts` to talk to Supabase.

Database notes & migration snippet
- The development schema is in `dev/sql.sql`. For an existing Postgres database, run the following to add the sport gender enum and column without destroying data:

```sql
DO $$ BEGIN
	PERFORM 1 FROM pg_type WHERE typname = 'sport_gender';
	IF NOT FOUND THEN
		CREATE TYPE sport_gender AS ENUM ('Mens','Womens','Both');
	END IF;
END $$;

ALTER TABLE public.sports
	ADD COLUMN IF NOT EXISTS gender sport_gender NOT NULL DEFAULT 'Both';
```

Developer tips
- Faculty logo uploads expect a Supabase storage bucket named `logos` (used by `createFaculty` in `src/lib/api.ts`).
- The admin UI is intentionally lightweight; replace local/mock auth with Supabase Auth (or other) before using in production.

Suggestions / next steps
- Wire admin login to Supabase Auth or another auth provider and persist a secure session (cookies or localStorage with JWT + refresh token).
- Add user roles and permission checks on the server.
- Extract the login panel into a reusable component under `src/components/admin` and add unit tests.

If you want, I can implement the secure auth integration and a basic route guard next. Reply with which provider you prefer (Supabase, Auth0, Firebase Auth, custom JWT) and I'll scaffold it.
