-- Run in Supabase SQL Editor. Save as "005_bootstrap_admin".
-- One-time (per environment) admin bootstrap: makes the given account able
-- to post testimonies. Using a plus-alias test account for now since the
-- new domains' real email addresses aren't set up yet — swap this to a
-- real admin address later (and re-run for production, adjusting the email).

update public.profiles
set is_admin = true
where id = (select id from auth.users where email = 'tyler+ootest2@ironshepherdsystems.com');
