-- Run in Supabase SQL Editor ONLY when you're ready to retire the old test
-- admin account. Save as "024_reassign_test_admin_content".
--
-- Deleting an account cascades to everything it authored, including admin
-- content (devotionals, resources, charities, podcast episodes, message
-- board posts) and — via devotionals — every member's testimony comments
-- underneath. Run this first to move that content to the real admin account.
--
-- Afterwards, delete the old test account from the Supabase dashboard
-- (Authentication -> Users); the app deliberately refuses to delete admins.
-- Whatever the old account posted as a member (test prayer requests,
-- check-ins, comments) is deleted with it.

begin;

update public.testimonies
set author_id = (select id from auth.users where email = 'tyler@ironshepherdsystems.com')
where author_id = (select id from auth.users where email = 'tyler+ootest2@ironshepherdsystems.com');

update public.resources
set created_by = (select id from auth.users where email = 'tyler@ironshepherdsystems.com')
where created_by = (select id from auth.users where email = 'tyler+ootest2@ironshepherdsystems.com');

update public.charities
set created_by = (select id from auth.users where email = 'tyler@ironshepherdsystems.com')
where created_by = (select id from auth.users where email = 'tyler+ootest2@ironshepherdsystems.com');

update public.podcast_episodes
set created_by = (select id from auth.users where email = 'tyler@ironshepherdsystems.com')
where created_by = (select id from auth.users where email = 'tyler+ootest2@ironshepherdsystems.com');

update public.message_board_posts
set created_by = (select id from auth.users where email = 'tyler@ironshepherdsystems.com')
where created_by = (select id from auth.users where email = 'tyler+ootest2@ironshepherdsystems.com');

commit;
