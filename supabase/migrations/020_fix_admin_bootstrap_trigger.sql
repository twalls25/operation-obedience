-- Run in Supabase SQL Editor. Save as "020_fix_admin_bootstrap_trigger".
--
-- Bug found while promoting tyler@ironshepherdsystems.com to admin: the
-- role/status-escalation trigger (012_profile_email_and_status.sql,
-- tightened in 016_no_admin_status_changes.sql) silently reverted the
-- change. 016's own comment claims running the UPDATE directly in the SQL
-- Editor "bypasses this trigger, same as it bypasses RLS" — that's wrong.
-- Superuser status bypasses RLS, but an ordinary trigger still fires
-- regardless of role, and auth.uid() (which reads the request's JWT) is
-- null when there's no PostgREST/Auth session — exactly the SQL Editor
-- case. With auth.uid() null, "not exists (... and role = 'admin')" is
-- always true, so the trigger kept reverting role/status back to their
-- old values no matter what was set.
--
-- Fix: treat a null auth.uid() as trusted. This is safe — every real app
-- request goes through PostgREST's RLS, and profiles' own update policies
-- (001_profiles.sql, 012_profile_email_and_status.sql) already require
-- auth.uid() = id or an admin match, both of which are never true when
-- auth.uid() is null, so RLS itself already blocks any anonymous/no-session
-- request from ever reaching a row this trigger would fire on. A null
-- auth.uid() inside this trigger can therefore only mean someone running
-- SQL directly as postgres, which is exactly the case 016 meant to exempt.
create or replace function public.prevent_self_role_status_escalation()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if old.role = 'admin' then
    new.role := old.role;
    new.status := old.status;
    return new;
  end if;

  if not exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ) then
    new.role := old.role;
    new.status := old.status;
  end if;

  return new;
end;
$$;

-- Re-run the promotion from 019_promote_real_admin.sql, which silently
-- no-op'd because of the bug above.
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'tyler@ironshepherdsystems.com');
