-- Run in Supabase SQL Editor. Save as "023_admin_delete_user".
--
-- Lets an admin permanently delete an account from the app without the app
-- ever holding a service-role key: a security-definer function does the
-- delete from auth.users. Everything the person wrote is removed by the
-- existing ON DELETE CASCADE chain (profile -> prayer requests, check-ins,
-- comments, reactions, and anything they authored as admin).
--
-- Guardrails live in the function, not just the UI: admins only, never
-- yourself, never another admin. The audit-log entry is written in the same
-- transaction, so there is never a deletion without a log row (and a failed
-- log write rolls the deletion back).
--
-- Also adds last_sign_in_at / email_confirmed_at to admin_get_profiles() so
-- the Members page can surface abandoned accounts.

begin;

drop function public.admin_get_profiles();

create function public.admin_get_profiles()
returns table (
  id uuid,
  name text,
  email text,
  role text,
  status text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  email_confirmed_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select p.id, p.name, p.email, p.role, p.status, p.created_at,
         u.last_sign_in_at, u.email_confirmed_at
  from public.profiles p
  join auth.users u on u.id = p.id
  where exists (
    select 1 from public.profiles admin_check
    where admin_check.id = auth.uid() and admin_check.role = 'admin'
  );
$$;

revoke execute on function public.admin_get_profiles() from public, anon;
grant execute on function public.admin_get_profiles() to authenticated;

create function public.admin_delete_user(target uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_email text;
  target_role text;
begin
  if not exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Only admins can delete accounts.';
  end if;

  if target = auth.uid() then
    raise exception 'You can''t delete your own account here.';
  end if;

  select u.email, p.role into target_email, target_role
  from auth.users u
  left join public.profiles p on p.id = u.id
  where u.id = target;

  if not found then
    raise exception 'That account no longer exists.';
  end if;

  if target_role = 'admin' then
    raise exception 'Admin accounts can''t be deleted from the app.';
  end if;

  insert into public.moderation_log (actor_id, action, target_type, target_id, note)
  values (
    auth.uid(),
    'member.delete',
    'profile',
    target,
    'Deleted account: ' || coalesce(target_email, 'unknown email')
  );

  delete from auth.users where id = target;
end;
$$;

revoke execute on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;

commit;
