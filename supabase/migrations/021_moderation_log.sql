-- Run in Supabase SQL Editor. Save as "021_moderation_log".
--
-- Moderation audit log (Phase M5 of moderation-scope.md): an append-only
-- record of every staff moderation action. Built first so every later
-- moderation feature logs from day one instead of being retrofitted.

-- Single choke point for "is the caller staff?". Admin-only today; when the
-- moderator role is introduced, widen the check constraint on profiles.role
-- and this function is already correct — no policy rewrites needed.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'moderator')
  );
$$;

create table public.moderation_log (
  id uuid primary key default gen_random_uuid(),
  -- on delete set null so the log outlives a deleted staff account.
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  -- Deliberately no foreign key: targets are polymorphic and may be
  -- hard-deleted (e.g. a removed comment), and the log must survive that.
  target_id uuid,
  note text,
  created_at timestamptz not null default now()
);

create index moderation_log_created_at_idx
  on public.moderation_log (created_at desc);

alter table public.moderation_log enable row level security;

create policy "Staff can read the moderation log"
  on public.moderation_log for select
  using (public.is_staff());

create policy "Staff can write their own log entries"
  on public.moderation_log for insert
  with check (actor_id = auth.uid() and public.is_staff());

-- Append-only: select + insert only. No update/delete grant and no policy
-- for either, so the app can never alter or erase an entry. (Direct SQL as
-- postgres still can; that's intentional.)
grant select, insert on public.moderation_log to authenticated;
