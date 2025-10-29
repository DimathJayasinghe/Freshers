# UOC Freshers' Meet 2025 (Frontend)

This repository contains the frontend for the UOC Freshers' Meet 2025 web application.

Key technologies
- React + TypeScript (Vite)
- Tailwind CSS for styling
- lucide-react for icons
- Supabase client helper present under `src/lib/supabaseClient.ts` (optional backend integration)

Author: Pahasara / UCSC Media Club

Quick links
- Production: https://uocfreshers.netlify.app/ (may show empty data while DB is populated)
- Development: https://uocfreshersdev.netlify.app/

Getting started (frontend)
1. Install dependencies

```powershell
npm install
```

2. Run development server

```powershell
npm run dev
```

3. Build for production

```powershell
npm run build
```

Notes
- The app uses local data helpers in `src/lib/api.ts`. Some pages include mock loading states and prototype admin UI.
- An Admin Dashboard page exists at the route `/admin`. See `src/pages/admin/README.md` for details about the admin prototype and local mock credentials.

Recent admin updates
- Admin pages now include dedicated routes for managing Faculties (`/admin/faculties`) and Lineup (`/admin/lineup`). The Admin UI is a prototype and supports basic CRUD for sports, faculties and scheduled events (lineup).
- Sports now include a `gender` applicability field (Mens / Womens / Both). The frontend and API accept this value when creating or editing sports.

Supabase integration & environment
- If you want full admin CRUD functionality (persisted data and media uploads), set the following Vite env variables in a `.env` file at repo root:

```env
VITE_SUPABASE_URL=https://your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- The admin features assume a Supabase storage bucket named `logos` (used for faculty logo uploads). Create this bucket in your Supabase project or update the code if you use a different bucket name.

Database migration (existing DB)
- The development SQL in `dev/sql.sql` contains the full schema for fresh DB setup. If you have an existing Postgres DB, apply this small migration to add the new `sport_gender` type and `gender` column on `public.sports`:

```sql
-- create enum (idempotent)
DO $$ BEGIN
	PERFORM 1 FROM pg_type WHERE typname = 'sport_gender';
	IF NOT FOUND THEN
		CREATE TYPE sport_gender AS ENUM ('Mens','Womens','Both');
	END IF;
END $$;

-- add column with default for existing table
ALTER TABLE public.sports
	ADD COLUMN IF NOT EXISTS gender sport_gender NOT NULL DEFAULT 'Both';
```

If you'd like, I can generate a migration file and add instructions to run it against your Supabase or Postgres instance.

Contributing
- Please follow the existing code style (TypeScript + Tailwind utility classes). If you add new components, place them under `src/components` and export/use the UI primitives in `src/components/ui`.

Security
- The current admin implementation is a prototype using local/mock credentials. Do NOT use it in production. Replace with proper auth (Supabase/Auth, JWT, or similar) and protect the `/admin` route.

If you need help running the project locally or want me to add CI scripts, tests, or a prettier/eslint setup, tell me which one to add and I'll implement it.