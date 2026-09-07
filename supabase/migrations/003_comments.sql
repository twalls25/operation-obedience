-- Run in Supabase SQL Editor. Save as "003_comments".
--
-- Generic comments table shared by testimonies, prayer requests, and
-- check-ins (see CLAUDE.md's "Shared architecture note"). Exactly one of
-- the three parent-id columns must be set per row.
--
-- These are plain uuid columns for now, NOT foreign keys to
-- testimonies/prayer_requests/checkins, because those tables don't exist
-- yet (Phases 4-6). Once each is created, add the matching FK with e.g.:
--   alter table public.comments
--     add constraint comments_testimony_id_fkey
--     foreign key (testimony_id) references public.testimonies(id) on delete cascade;
--
-- user_id references profiles (not auth.users) so PostgREST can embed the
-- author's name directly via comments -> profiles.

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  testimony_id uuid,
  prayer_request_id uuid,
  checkin_id uuid,
  created_at timestamptz not null default now(),
  constraint comments_exactly_one_parent check (
    (case when testimony_id is not null then 1 else 0 end) +
    (case when prayer_request_id is not null then 1 else 0 end) +
    (case when checkin_id is not null then 1 else 0 end) = 1
  )
);

create index comments_testimony_id_idx on public.comments (testimony_id);
create index comments_prayer_request_id_idx on public.comments (prayer_request_id);
create index comments_checkin_id_idx on public.comments (checkin_id);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy "Users can insert their own comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

-- RLS policies only restrict *which* rows a role can touch; the role still
-- needs base table privileges granted (see 002_profiles_grants.sql notes).
grant select on public.comments to anon, authenticated;
grant insert on public.comments to authenticated;
