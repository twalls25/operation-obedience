-- Run in Supabase SQL Editor. Save as "006_prayer_requests".

create table public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create index prayer_requests_created_at_idx on public.prayer_requests (created_at desc);

alter table public.prayer_requests enable row level security;

create policy "Prayer requests are viewable by everyone"
  on public.prayer_requests for select
  using (true);

create policy "Users can insert their own prayer requests"
  on public.prayer_requests for insert
  with check (auth.uid() = user_id);

grant select on public.prayer_requests to anon, authenticated;
grant insert on public.prayer_requests to authenticated;

-- "praying for this" reaction, one per user per request (toggleable).
create table public.prayer_reactions (
  prayer_request_id uuid not null references public.prayer_requests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (prayer_request_id, user_id)
);

alter table public.prayer_reactions enable row level security;

create policy "Prayer reactions are viewable by everyone"
  on public.prayer_reactions for select
  using (true);

create policy "Users can add their own reaction"
  on public.prayer_reactions for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own reaction"
  on public.prayer_reactions for delete
  using (auth.uid() = user_id);

grant select on public.prayer_reactions to anon, authenticated;
grant insert, delete on public.prayer_reactions to authenticated;

-- Now that prayer_requests exists, add the FK comments.prayer_request_id
-- was waiting on (see supabase/migrations/003_comments.sql).
alter table public.comments
  add constraint comments_prayer_request_id_fkey
  foreign key (prayer_request_id) references public.prayer_requests(id) on delete cascade;
