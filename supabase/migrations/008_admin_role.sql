-- Run in Supabase SQL Editor. Save as "008_admin_role".
-- Replaces the profiles.is_admin boolean with a role column, so admin
-- status is modeled the same way for testimonies and the new Content
-- Library feature (Phase 7) instead of two parallel flags.

alter table public.profiles
  add column role text not null default 'member' check (role in ('member', 'admin'));

update public.profiles set role = 'admin' where is_admin = true;

-- The old testimonies insert policy references is_admin directly, so it
-- has to be dropped before that column can go away.
drop policy "Admins can insert testimonies" on public.testimonies;

create policy "Admins can insert testimonies"
  on public.testimonies for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

alter table public.profiles drop column is_admin;
