-- Run in Supabase SQL Editor. Save as "009_resources".
-- Content Library: books, sermons, videos, articles, and multi-week plans
-- all live in one table, since a plan is just a longer piece of browsable
-- content. Admin-gated inserts, using the new profiles.role column.

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('book', 'sermon', 'video', 'article', 'plan')),
  title text not null,
  author text,
  link text,
  description text not null,
  content text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create index resources_type_idx on public.resources (type);
create index resources_date_idx on public.resources (date desc);

alter table public.resources enable row level security;

create policy "Resources are viewable by everyone"
  on public.resources for select
  using (true);

create policy "Admins can insert resources"
  on public.resources for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

grant select on public.resources to anon, authenticated;
grant insert on public.resources to authenticated;
