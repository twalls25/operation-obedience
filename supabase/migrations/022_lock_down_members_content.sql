-- Run in Supabase SQL Editor. Save as "022_lock_down_members_content".
--
-- Moves "members-only" from page redirects into the database itself.
--
-- Found 2026-11-05: prayer_requests, prayer_reactions, checkins, comments,
-- and plan/video resources all had `select ... using (true)` policies plus
-- `grant select ... to anon`, so anyone holding the public publishable key
-- (it ships in the site's JavaScript) could read them straight from the
-- Supabase REST API, bypassing every page-level login redirect. Likewise,
-- insert policies only checked `auth.uid() = user_id`, so a restricted
-- member could write directly via the API even though the app blocks it.
--
-- Not changed on purpose: `testimonies` (admin-authored devotionals, public
-- by design) and `profiles` (names/roles/status are readable by everyone;
-- no emails — see 012). Revisit profiles if the member roster should itself
-- be private.

begin;

-- "Approved" = may READ members-only content (active or restricted;
-- restricted members can read but not post). "Active" = may WRITE.
-- Both return false for anonymous callers (auth.uid() is null) and for
-- banned members.
create or replace function public.is_approved_member()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status in ('active', 'restricted')
  );
$$;

create or replace function public.is_active_member()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'active'
  );
$$;

-- The logged-out "N active prayer requests" teaser needs a count without
-- being able to read the rows themselves.
create or replace function public.prayer_request_count()
returns bigint
language sql
stable
security definer set search_path = ''
as $$
  select count(*) from public.prayer_requests;
$$;

grant execute on function public.prayer_request_count() to anon, authenticated;

-- Prayer requests
drop policy "Prayer requests are viewable by everyone" on public.prayer_requests;
create policy "Approved members can view prayer requests"
  on public.prayer_requests for select
  using (public.is_approved_member());

drop policy "Users can insert their own prayer requests" on public.prayer_requests;
create policy "Active members can insert their own prayer requests"
  on public.prayer_requests for insert
  with check (auth.uid() = user_id and public.is_active_member());

-- Prayer reactions (removing your own reaction stays allowed for anyone)
drop policy "Prayer reactions are viewable by everyone" on public.prayer_reactions;
create policy "Approved members can view prayer reactions"
  on public.prayer_reactions for select
  using (public.is_approved_member());

drop policy "Users can add their own reaction" on public.prayer_reactions;
create policy "Active members can add their own reaction"
  on public.prayer_reactions for insert
  with check (auth.uid() = user_id and public.is_active_member());

-- Check-ins
drop policy "Checkins are viewable by everyone" on public.checkins;
create policy "Approved members can view checkins"
  on public.checkins for select
  using (public.is_approved_member());

drop policy "Users can insert their own checkins" on public.checkins;
create policy "Active members can insert their own checkins"
  on public.checkins for insert
  with check (auth.uid() = user_id and public.is_active_member());

drop policy "Users can update their own checkins" on public.checkins;
create policy "Active members can update their own checkins"
  on public.checkins for update
  using (auth.uid() = user_id and public.is_active_member());

-- Comments: every parent type is now members-only to read (supersedes the
-- message-board-only rule from 018), and writing requires an active member.
drop policy "Comments are viewable based on parent visibility" on public.comments;
create policy "Approved members can view comments"
  on public.comments for select
  using (public.is_approved_member());

drop policy "Users can insert their own comments" on public.comments;
create policy "Active members can insert their own comments"
  on public.comments for insert
  with check (auth.uid() = user_id and public.is_active_member());

-- Resources: book/sermon/article stay public (mirrors PUBLIC_RESOURCE_TYPES
-- in src/lib/resources/types.ts — keep the two in sync); plan/video are
-- members-only.
drop policy "Resources are viewable by everyone" on public.resources;
create policy "Public resource types are viewable by everyone, the rest by approved members"
  on public.resources for select
  using (
    type in ('book', 'sermon', 'article') or public.is_approved_member()
  );

commit;
