alter table public.scheduled_events enable row level security;
create policy "scheduled_events_select_public"
on public.scheduled_events
for select
to anon, authenticated
using (true);

-- Allow INSERT by authenticated admins
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

-- Allow UPDATE by authenticated admins
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

-- Allow DELETE by authenticated admins
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
-- INSERT for authenticated admins
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

-- UPDATE for authenticated admins
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

-- DELETE for authenticated admins
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
