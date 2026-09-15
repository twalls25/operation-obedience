-- Run in Supabase SQL Editor. Save as "018_message_board".
--
-- Message Board: public admin-posted announcements (updates, events,
-- general news), same admin-gated pattern as testimonies/resources.
-- Category exists as a column for future filtering but has no UI selector
-- yet — everything defaults to 'general', same as the rest of the Content
-- Library when it launched with only one real type in use.

create table public.message_board_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text not null default 'general',
  pinned boolean not null default false,
  created_by uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create index message_board_posts_pinned_date_idx
  on public.message_board_posts (pinned desc, date desc);

alter table public.message_board_posts enable row level security;

create policy "Message board posts are viewable by everyone"
  on public.message_board_posts for select
  using (true);

create policy "Admins can insert message board posts"
  on public.message_board_posts for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

grant select on public.message_board_posts to anon, authenticated;
grant insert on public.message_board_posts to authenticated;

-- Extend the shared comments table (003_comments.sql) with a fourth parent
-- type. Unlike the other three, the post itself is public but comments are
-- members-only (Tyler's spec) — so the old blanket "viewable by everyone"
-- select policy is replaced with one that keeps testimony/prayer/checkin
-- comments public (message_board_post_id is null for those) while
-- requiring auth specifically for message-board comments.
alter table public.comments
  add column message_board_post_id uuid references public.message_board_posts(id) on delete cascade;

alter table public.comments
  drop constraint comments_exactly_one_parent;

alter table public.comments
  add constraint comments_exactly_one_parent check (
    (case when testimony_id is not null then 1 else 0 end) +
    (case when prayer_request_id is not null then 1 else 0 end) +
    (case when checkin_id is not null then 1 else 0 end) +
    (case when message_board_post_id is not null then 1 else 0 end) = 1
  );

create index comments_message_board_post_id_idx
  on public.comments (message_board_post_id);

drop policy "Comments are viewable by everyone" on public.comments;

create policy "Comments are viewable based on parent visibility"
  on public.comments for select
  using (
    message_board_post_id is null or auth.uid() is not null
  );
