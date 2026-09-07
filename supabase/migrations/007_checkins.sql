-- Run in Supabase SQL Editor. Save as "007_checkins".

create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  trained boolean not null default false,
  trained_note text,
  prayed boolean not null default false,
  prayed_note text,
  scripture boolean not null default false,
  scripture_note text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index checkins_date_idx on public.checkins (date desc);
create index checkins_user_id_date_idx on public.checkins (user_id, date desc);

alter table public.checkins enable row level security;

create policy "Checkins are viewable by everyone"
  on public.checkins for select
  using (true);

create policy "Users can insert their own checkins"
  on public.checkins for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own checkins"
  on public.checkins for update
  using (auth.uid() = user_id);

grant select on public.checkins to anon, authenticated;
grant insert, update on public.checkins to authenticated;

-- Now that checkins exists, add the FK comments.checkin_id was waiting on
-- (see supabase/migrations/003_comments.sql).
alter table public.comments
  add constraint comments_checkin_id_fkey
  foreign key (checkin_id) references public.checkins(id) on delete cascade;
