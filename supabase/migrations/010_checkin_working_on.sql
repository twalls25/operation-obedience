-- Run in Supabase SQL Editor. Save as "010_checkin_working_on".
-- Free-text field for a man to note what he's working through
-- (e.g. a Content Library plan), with no relational link to resources.

alter table public.checkins add column working_on text;
