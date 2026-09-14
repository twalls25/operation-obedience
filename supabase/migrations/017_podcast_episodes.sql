-- Run in Supabase SQL Editor. Save as "017_podcast_episodes".

create table public.podcast_episodes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null default current_date,
  spotify_url text,
  apple_podcasts_url text,
  youtube_url text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index podcast_episodes_date_idx on public.podcast_episodes (date desc);

alter table public.podcast_episodes enable row level security;

create policy "Podcast episodes are viewable by everyone"
  on public.podcast_episodes for select
  using (true);

create policy "Admins can insert podcast episodes"
  on public.podcast_episodes for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

grant select on public.podcast_episodes to anon, authenticated;
grant insert on public.podcast_episodes to authenticated;
