-- Run in Supabase SQL Editor. Save as "019_promote_real_admin".
-- Promotes Tyler's permanent real account to admin. The original admin
-- bootstrap (005_bootstrap_admin.sql) used a plus-alias test account since
-- this domain's real address wasn't set up yet — this is that real account
-- now that it exists as a member.

update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'tyler@ironshepherdsystems.com');
