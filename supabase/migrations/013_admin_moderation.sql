-- Run in Supabase SQL Editor. Save as "013_admin_moderation".

-- Admin-only read of all profiles including email (bypasses the column
-- restriction from 012 via security definer). Returns nothing for
-- non-admin callers rather than erroring.
create or replace function public.admin_get_profiles()
returns table (
  id uuid,
  name text,
  email text,
  role text,
  status text,
  created_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select p.id, p.name, p.email, p.role, p.status, p.created_at
  from public.profiles p
  where exists (
    select 1 from public.profiles admin_check
    where admin_check.id = auth.uid() and admin_check.role = 'admin'
  );
$$;

grant execute on function public.admin_get_profiles() to authenticated;

-- Admins can delete any comment, anywhere (testimonies, prayer requests,
-- check-ins).
create policy "Admins can delete any comment"
  on public.comments for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

grant delete on public.comments to authenticated;
