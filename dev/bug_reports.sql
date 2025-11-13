-- Bug reports table for user-submitted issues
-- Run in Supabase/Postgres

create table if not exists public.bug_reports (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  title text not null,
  description text not null,
  page_url text,
  contact text,
  user_agent text,
  status text not null default 'open' check (status in ('open','resolved'))
);

-- Helpful indexes
create index if not exists bug_reports_status_idx on public.bug_reports (status);
create index if not exists bug_reports_created_at_idx on public.bug_reports (created_at desc);

-- If using Supabase, enable RLS and add policies (adjust as needed)
-- alter table public.bug_reports enable row level security;
--
-- -- Allow anyone to submit bugs
-- create policy "Bug reports: allow insert from anon" on public.bug_reports
--   for insert to anon
--   with check (true);
--
-- -- Allow authenticated users (admins) to view and update
-- create policy "Bug reports: allow read to authenticated" on public.bug_reports
--   for select to authenticated
--   using (true);
--
-- create policy "Bug reports: allow update to authenticated" on public.bug_reports
--   for update to authenticated
--   using (true)
--   with check (true);
