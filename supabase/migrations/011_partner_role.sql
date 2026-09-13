-- Run in Supabase SQL Editor. Save as "011_partner_role".
-- Widens profiles.role to also allow 'partner', reserved for future use —
-- no UI references it yet (Partnerships page etc. are on hold until there's
-- a real partner). Existing 'member'/'admin' rows are unaffected.

alter table public.profiles drop constraint profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('member', 'admin', 'partner'));
