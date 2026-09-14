-- Run in Supabase SQL Editor. Save as "016_no_admin_status_changes".
-- Extends the role/status-escalation trigger from 012_profile_email_and_status
-- so that NO ONE — not even another admin — can change role/status on a
-- row that is currently an admin, through the app. Locking out or
-- demoting an admin must go through Tyler directly in the SQL Editor
-- (which runs as postgres and bypasses this trigger, same as it bypasses
-- RLS), not through the admin UI.

create or replace function public.prevent_self_role_status_escalation()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
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
