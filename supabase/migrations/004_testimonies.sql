-- Run in Supabase SQL Editor. Save as "004_testimonies".

alter table public.profiles add column is_admin boolean not null default false;

create table public.testimonies (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  verse_reference text not null,
  verse_text text not null,
  context text not null,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create index testimonies_date_idx on public.testimonies (date desc);

alter table public.testimonies enable row level security;

create policy "Testimonies are viewable by everyone"
  on public.testimonies for select
  using (true);

create policy "Admins can insert testimonies"
  on public.testimonies for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin
    )
  );

grant select on public.testimonies to anon, authenticated;
grant insert on public.testimonies to authenticated;

-- Now that testimonies exists, add the FK comments.testimony_id was
-- waiting on (see supabase/migrations/003_comments.sql).
alter table public.comments
  add constraint comments_testimony_id_fkey
  foreign key (testimony_id) references public.testimonies(id) on delete cascade;
