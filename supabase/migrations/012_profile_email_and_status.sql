-- Run in Supabase SQL Editor. Save as "012_profile_email_and_status".

-- 1. Store email on profiles (needed to notify members without a
-- service-role key, which this app deliberately avoids handling).
alter table public.profiles add column email text;

update public.profiles
set email = auth.users.email
from auth.users
where profiles.id = auth.users.id;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- 2. Moderation status. Must exist before the column-select grant below,
-- which references it.
alter table public.profiles
  add column status text not null default 'active' check (status in ('active', 'restricted', 'banned'));

-- email is private: RLS is row-level, not column-level, so "viewable by
-- everyone" would otherwise expose every member's email to anyone hitting
-- the public API directly with the anon key. Lock the column down; the
-- admin_get_profiles() function in the next migration bypasses this via
-- security definer for admin-only reads.
revoke select on public.profiles from anon, authenticated;
grant select (id, name, avatar_url, role, status, created_at) on public.profiles to anon, authenticated;

-- 3. Close a pre-existing gap: the blanket update grant from
-- 002_profiles_grants.sql lets any user update any column on their own
-- row, including role/status — RLS's "own row" check doesn't restrict
-- which columns. A trigger is the reliable way to block that (RLS's
-- WITH CHECK can't compare against the pre-update value here).
create or replace function public.prevent_self_role_status_escalation()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ) then
    new.role := old.role;
    new.status := old.status;
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_status_escalation
  before update on public.profiles
  for each row execute function public.prevent_self_role_status_escalation();

-- 4. Let admins update any profile's status (the trigger above still
-- guards role/status from non-admin self-edits regardless of this policy).
create policy "Admins can update any profile"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );
