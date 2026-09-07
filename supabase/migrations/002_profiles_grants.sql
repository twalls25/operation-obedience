-- Run in Supabase SQL Editor. RLS policies only restrict *which rows* a
-- role can see/change; the role still needs base table privileges granted,
-- which this project didn't set up automatically for tables created via SQL.
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
