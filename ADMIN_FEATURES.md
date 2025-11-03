Admin features added (summary)
=================================

What I implemented
- Added an admin sport edit page: `src/pages/admin/AdminSportEdit.tsx`.
  - URL: `/admin/sports/:sportId`
  - Create event-level results and add ordered place rows (1st, 2nd, 3rd, ...).
  - Lists existing results for the chosen sport and allows viewing places.

- Added API helpers to `src/lib/api.ts` to support admin operations:
  - `fetchFacultiesList()` — simple faculty id/name list.
  - `createResult(...)` — insert a row into `results`.
  - `addResultPositions(resultId, positions)` — insert rows into `result_positions`.
  - `fetchResultsBySport(sportId)` and `fetchResultPositions(resultId)` for convenience.

- Points allocation and result lifecycle helpers:
  - `applyPointsForResult(resultId)` — applies points for an overall result into `faculty_points` using the scoring rules (1st=7,2nd=5,3rd=3,4th=2,5th+ =1).
  - `removePointsForResult(resultId)` — reverses points previously applied for an overall result.
  - `deleteResult(resultId)` — removes positions and the result row, and reverses points if applicable.

- Added admin data types: `src/data/adminData.ts`.

- Updated `src/pages/admin/AdminSports.tsx` to link to the new sport edit page (edit button navigates to `/admin/sports/:sportId`).

- Replaced placeholder `AdminPoints` page with a basic UI for adding overall results and ranks per sport. Uses the new API helpers.

Why this was done
- You requested a dedicated admin sport edit page and the ability to add event-level ranks for non-team sports, and separate overall mens/womens rank lists for team sports.

How to use
1. In the admin area open: `/admin/sports` and click the edit button for a sport to open the new editor.
2. On the sport edit page you can add an event name, choose gender/date/time and add ordered places (pick faculty ids).
3. Use `/admin/points` for a quick form to add an overall result for a sport (team events) — or use the sport edit page for event-level results.

Notes about SQL / schema mapping
- The code uses these SQL tables (see `dev/sql.sql` for the canonical schema):
  - `results` (id, sport_id, event, category, gender, event_date, event_time, created_at)
  - `result_positions` (result_id, place, faculty_id)
  - `faculties` for faculty ids and names

Points allocation rules implemented
- When a result is created and identified as an "overall" result (heuristic: event name contains 'overall' or is empty), the system will immediately allocate points to `faculty_points`:
  - 1st place: 7 points
  - 2nd place: 5 points
  - 3rd place: 3 points
  - 4th place: 2 points
  - 5th and beyond: 1 point each

- Points are added to either `mens_points` or `womens_points` depending on the result.gender value (case-insensitive match for 'men'/'women'). For results with mixed/other genders the implementation currently applies the points to `mens_points` (this is a simple fallback; we can change this behavior if you prefer a different policy).

- When deleting a result via the admin UI (or `deleteResult` API), the implementation attempts to reverse the previously-applied points by subtracting the same values from `faculty_points` (clamped at zero).

- I ran a repo search for `event_order` (your earlier request) and found no occurrences in the workspace SQL files. If you intended to remove a column in a migration on a live DB, you can run a safe migration such as:

  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'your_table' AND column_name = 'event_order'
    ) THEN
      ALTER TABLE public.your_table DROP COLUMN event_order;
    END IF;
  END
  $$;

Conflicts / comments
- I searched `dev/sql.sql` and `dev/dummyData.sql` and did not find `event_order` anywhere — so there were no direct conflicts to resolve.
- I created new API functions; if you have Row Level Security (RLS) policies in your Supabase project you may need to add appropriate admin policies or run these APIs with a service role.

Next steps / suggestions
- Add basic validation and display of faculty names in the sport edit page (currently selection uses faculty id).
- Optionally add an Audit log for admin changes.
- Add tests around the new API helpers and a small end-to-end test for the admin pages.

If you want I can also:
- Add an SQL migration to drop `event_order` from a specific table (if you tell me which table),
- Or implement server-side batching to update `faculty_points` automatically when adding results (so leaderboard updates automatically).

Files added/changed
- src/lib/api.ts — added admin helpers
- src/data/adminData.ts — new admin types
- src/pages/admin/AdminSportEdit.tsx — new page
- src/pages/admin/AdminSports.tsx — updated to link to editor
- src/pages/admin/AdminPoints.tsx — updated UI
- src/App.tsx — added route for editor

Verification
- Ran `npm run build` (which runs `tsc -b && vite build`) — TypeScript build passed locally in this workspace.

If you'd like, I can open a PR with these changes and add unit tests or further polish the UI.
