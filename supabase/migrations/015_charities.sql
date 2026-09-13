-- Run in Supabase SQL Editor. Save as "015_charities".

create table public.charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  link text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create index charities_date_idx on public.charities (date desc);

alter table public.charities enable row level security;

create policy "Charities are viewable by everyone"
  on public.charities for select
  using (true);

create policy "Admins can insert charities"
  on public.charities for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

grant select on public.charities to anon, authenticated;
grant insert on public.charities to authenticated;
