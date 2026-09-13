-- Run in Supabase SQL Editor. Save as "014_contact_messages".

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Anyone (including logged-out visitors) can submit the contact form.
create policy "Anyone can submit a contact message"
  on public.contact_messages for insert
  with check (true);

-- Only admins can read submitted messages back out (Resend delivers the
-- actual notification; this table is durable backup storage, not a UI).
create policy "Admins can view contact messages"
  on public.contact_messages for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

grant insert on public.contact_messages to anon, authenticated;
grant select on public.contact_messages to authenticated;
