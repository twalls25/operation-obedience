# Operation Obedience — Project Context

## What this is
A Christian men's ministry web app combining spiritual formation, accountability, and fitness. The name "Operation Obedience" is grounded in two passages:
- **2 Corinthians 10:3–5** — spiritual warfare, tearing down strongholds, taking every thought captive to obedience. This is the organizing theme: obedience is the active mechanism that tears down strongholds in the mind, family, church, community, and body.
- **1 Corinthians** — the body as the temple of the Holy Spirit, which grounds the fitness component theologically (the body is something to be kept and defended, not a bolted-on feature).

Tone: warm and brotherly, but with real strength and the expectation of tough love — a brotherhood that welcomes and challenges in equal measure.

Domains owned: operationobedience.com and operationobedience.org

## Tech stack
- Next.js (App Router), TypeScript, Tailwind CSS
- Supabase (database + auth)
- Vercel (hosting)
- GitHub (version control)

## How we work together — READ THIS FIRST
This is a "Claude writes, Tyler vets" workflow. Concretely, that means:
- **Never create accounts, sign into any service, or handle/paste credentials, API keys, or passwords.** Tyler owns all logins (GitHub, Supabase, Vercel) and handles anything requiring authentication himself. If a step needs this, stop and tell Tyler exactly what to do and where — don't attempt it.
- Walk through what you're about to do before doing it, especially for anything beyond a small, obvious code change, so Tyler can review before it's final.
- Commit logically-scoped chunks of work with clear commit messages so there are good rollback points.
- Keep this file updated as decisions get made (e.g. note when a phase is completed, or when a design decision changes) so future sessions don't lose context.

## Branding
**v1 applied** (logo + color palette). Full spec in `BRANDING.md`; source logo at `public/logo.svg`, used directly (not edited) per Tyler's approval. Palette added as Tailwind theme tokens in `src/app/globals.css` under `@theme` — `bg-charcoal`, `bg-panel`, `bg-ember`/`text-ember`, `text-offwhite`, `text-muted`. This is a dark-theme-only app now (no light mode, no `dark:` variants needed) — charcoal is the base background everywhere, ember is the only accent color, used for buttons/links/highlights.

Two pragmatic exceptions to "ember is the only accent," flagged per Tyler's instruction to check in before adding colors: error banners use a dark red (`border-red-900 bg-red-950/60 text-red-300`) and there's no separate success color — success messages reuse the panel background with an ember left-border accent instead of introducing green. Revisit if Tyler wants error states to use a different treatment.

**Known logo issues:**
1. ~~Background mismatch~~ **Fixed**: `logo.svg` originally baked in its own background rect (`#17191c`), a slightly different shade than the site's `panel` color it sat on in the nav, showing up as a faint box. Removed the rect (the file's metadata shows it was Claude-generated, not an external designer's locked asset, so this was a safe trivial fix) — the mark itself (text, sword, reticle) is untouched, just transparent now.
2. **Still open — legibility at nav size**: the two-line stacked wordmark ("OPERATION" / "OBEDIENCE") with the reticle-O and sword-T/I detail is hard to read at typical nav-bar heights. Currently rendered at `h-14` (56px) in the nav as a compromise — smaller and the sword/reticle detail disappears entirely; even at this size it's not fully crisp. May need a simplified/single-line variant for small placements (nav, favicon) with the full lockup reserved for larger placements (e.g. an About page hero).
3. Emblem/favicon is intentionally still the platform default per `BRANDING.md` — not an oversight, don't touch until Tyler provides one.

## Local dev environment notes
- `localhost:3000` (started via `preview_start`) only runs inside Claude Code's own sandbox — Tyler cannot reach it from his machine. He always tests against the live Vercel URL. This means: (1) don't ask Tyler to test something at `localhost`, only the deployed site; (2) any feature Tyler needs to interactively verify must be committed *and pushed* first, not just built and dev-server-tested; (3) since Turnstile now blocks Claude's own automated browser from logging in at all (correctly — that's its job), any login-gated flow can only be verified by Tyler on the live site going forward, not by Claude locally.
- Tyler's machine has network-level TLS inspection (security software) that Node doesn't trust by default, causing `fetch failed` / `unable to verify the first certificate` errors on any outbound HTTPS call from the dev server (e.g. to Supabase) — but not from plain `node -e` scripts run outside the dev server process. Fixed by running `next dev` with `NODE_OPTIONS=--use-system-ca` (see the `dev` script in `package.json`, using `cross-env` for cross-platform env vars) so Node trusts the same root CA store Windows does. If a similar "fetch failed" error resurfaces, check this first before assuming it's a Supabase config issue.

## Incident: production was broken from Phase 3 through Phase 8 (fixed 2026-09-13)
**What happened**: every deploy from commit `86e8062` (Phase 3, shared comments) through `076b15e` (Turnstile) failed Vercel's production build with TypeScript errors, so Vercel kept serving the last successful build — from Phase 2, before branding, before Testimonies/Prayers/Check-Ins/Content Library/Mission even existed. The site *looked* fine in every local browser check because verification only ever used `next dev`, which does not enforce full type-checking. `next build` (what Vercel actually runs) does, and it was failing silently the whole time — nothing in the local workflow surfaced it, and none of the phase-completion notes above claiming "verified end-to-end in browser" were false, they just weren't testing the thing that actually breaks in production.

**Root causes** (all fixed in the commit after this note):
1. Supabase's TS inference treats a `profiles(name)` embed as an array (`{name: any}[]`) when there's no generated `Database` types file, even though these are all many-to-one relationships that return a single object at runtime — which is why everything worked correctly in the browser despite the type being wrong. Fixed with `.returns<T>()` on each affected query to assert the real shape, rather than generating full DB types (a bigger lift not warranted for this fix).
2. One real type-narrowing gap in `src/lib/comments/types.ts`'s `parentColumn` (the union guarantees `checkinId` is set in the final branch, but TS can't prove it through optional-property narrowing without a discriminant tag) — fixed with a justified `as string` assertion.

**Process change going forward**: run `npm run build` locally (not just `next dev`) before considering any phase/feature done, especially before telling Tyler something is "verified." This is now the actual bar, not the dev server.

**Resolved**: commit `2d50c34` deployed successfully (Vercel shows "Ready"). Confirmed live: full branding/logo/nav restored, and Tyler tested a real sign-up on the live site — got the confirmation email, logged in, no visible Turnstile challenge (it solved invisibly in the background, as designed).

## Shared architecture note
Testimonies, prayer requests, and check-ins all share one reusable comments system — a single `comments` table linked by post ID to `testimony_id` / `prayer_request_id` / `checkin_id`. Build the comment component generically once, then wire it into each feature, rather than building separate comment systems per feature.

## Public vs member visibility model
Added in Phase 8. This is the standing reference for what's public vs. members-only — check here before adding a new page rather than guessing.

**Public (no login required):**
- `/mission` — always public, no auth check needed.
- `/` (home) — today's testimony full text is public. The comment thread underneath it is not (see the comment/discussion system note below) — logged-out visitors see "Log in to join the discussion" instead of a link to the detail page. Also shows a prayer-request count teaser (see below) in place of the "Browse the archive" link.
- `/resources` and `/resources/[id]` — filtered, not redirected: logged-out visitors only see `book`/`sermon`/`article` types (`PUBLIC_RESOURCE_TYPES` in `src/lib/resources/types.ts`); `plan`/`video` are excluded from listings and filter tabs, and direct access to a `plan`/`video` resource's detail page redirects to `/login`. `/resources/new` (admin-only) is unaffected.
- `/prayers` — branches instead of redirecting: logged-out visitors get a count-only summary ("N active prayer requests from our brotherhood" + a log in/sign up prompt, via `src/lib/prayers.ts`'s `getActivePrayerCount`), not the list. `/prayers/[id]` (individual requests) redirects logged-out visitors to `/login`.
- `/charities` — public listing, admin-manageable (`/charities/new`), matching the Content Library pattern. See Phase 8 notes.
- `/podcast` — public listing, admin-manageable (`/podcast/new`), same pattern again. See Phase 8 notes.
- `/contact` — public, Turnstile-protected (see Phase 8 notes on Turnstile for non-Auth forms).
- `/guidelines` — public, static content page, linked from the site footer (new — see `src/components/footer.tsx`, rendered in `layout.tsx` on every page) and from the comment-removal notification email.
- `/message-board` and `/message-board/[id]` — post content is fully public, admin-manageable (`/message-board/new`), same pattern as Charities/Podcast. Its comment thread is the exception to "comments generally require login" below: it's independently gated rather than inheriting visibility from a members-only page. See Phase 8 notes.

**Members-only (redirect to `/login` if logged out):**
- `/testimonies` (archive) and `/testimonies/[id]` (detail + comments) — only today's testimony is public, and only on the home page.
- `/prayers/[id]` and the full `/prayers` board (see above — same route, branches on auth).
- `/checkins`, `/checkins/[id]`, `/checkins/new` — check-ins are members-only in full, no public teaser.
- `plan`/`video` resources specifically (see above — same routes as the public types, branches per-resource).
- The comment/discussion system generally — viewing and posting both require login, everywhere it's embedded (testimonies/prayers/checkins detail pages). Confirmed correct with Tyler. **Message Board is the one exception**: its post is public but its comments still require login — see below.
- `/profile`, `/resources/new`, `/testimonies/new`, `/prayers/new`, `/message-board/new`, `/admin/*` — unchanged, already required login (some also require admin).

**Comments on an otherwise-public post (Message Board)**: don't redirect the page, and don't gate the `<Comments>` component's *rendering* alone — that's UI-only. Fetch `user` first; if present, render `<Comments {...parent} path={...} />` as usual, otherwise render a "Log in to join the discussion" prompt instead of the component. Back it with a matching RLS policy on `comments` (`message_board_post_id is null or auth.uid() is not null` — see `018_message_board.sql`) so the restriction holds even against a direct API call, not just the page's own choice not to render. If a future feature needs this same "public post, gated comments" shape, follow this pattern rather than the page-level redirect used for testimonies/prayers/checkins.

**How to extend this for a new page:**
- **Fully members-only**: near the top of the page component, `const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login");` — same pattern used throughout. Add its nav link inside `nav-client.tsx`'s auth-gated block.
- **Fully public**: no auth check at all. Add its nav link outside the auth-gated block (still inside the nav, so it always renders).
- **Partial/teaser** (some content public, more behind login — like `/prayers` and `/resources`): don't redirect the whole route. Fetch `user` first, then branch what you query/render based on its presence, same shape as `/prayers/page.tsx` or `/resources/page.tsx`.
- **Public content, gated comments** (like Message Board): see above.
- The nav bar's data-fetching lives in `src/components/nav.tsx` (computes `user` and `isAdmin`, passes them to `src/components/nav-client.tsx` for rendering) — reuse those rather than re-fetching.

## Build checklist

### Phase 0: Setup (Tyler — done outside Claude Code)
- [x] Install Node.js (LTS version)
- [x] Install Claude Code (desktop app)
- [x] Create a free GitHub account
- [x] Create a free Supabase account
- [x] Create a free Vercel account
- [x] Create project folder and open it in Claude Code

### Phase 1: Project Scaffolding — COMPLETE
- [x] Scaffold a new Next.js project in this folder (App Router, TypeScript, Tailwind)
- [x] Tyler connects the folder to a new GitHub repo (`git init`/`git push` — Tyler authenticates)
- [x] Tyler connects the GitHub repo to Vercel (Tyler logs in via Vercel's dashboard)
- [x] Tyler creates a Supabase project and pastes the URL/API keys into a local `.env` file (tell Tyler exactly what to paste and where — never see or handle the actual keys)
- [x] Confirm the "hello world" version deploys and loads on a live URL

Notes:
- Live at https://operation-obedience.vercel.app (auto-deploys on push to `master`)
- Supabase project: `rjmxmdhuerrcxxcljnnl`. Env vars used in code: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (set locally in `.env.local` and in Vercel's dashboard as Config, not Secret, since they're `NEXT_PUBLIC_` and safe to expose client-side)

### Phase 2: User Accounts — COMPLETE
- [x] Set up Supabase Auth (email/password sign up + login)
- [x] Build sign-up page
- [x] Build login page
- [x] Build basic profile (name, avatar optional) — `/profile`, backed by the `profiles` table
- [x] Add logged-in/logged-out states across the app (nav bar changes, protected pages)

Notes:
- Full loop verified end-to-end in the real browser: sign up -> confirmation email -> click link -> logged in -> edit/save profile name -> log out.
- Two gotchas hit and fixed along the way (both noted above/in migrations so they don't get re-debugged from scratch):
  - Local dev TLS fetch failures (see "Local dev environment notes").
  - `profiles` table needed explicit `grant` statements beyond RLS policies — RLS restricts *which* rows a role can touch, but the role still needs base table privileges granted first. See `supabase/migrations/002_profiles_grants.sql`.
- The email-confirmation link is PKCE-based: it only works when the same browser that submitted the sign-up form later clicks the link (a cookie-bound "code verifier" ties them together). Doesn't affect real users — they naturally do both in one browser — but matters for testing: Claude testing signup via its own automated browser can't complete confirmation itself; Tyler needs to do that step in his own browser.
- Supabase's shared/default email sending has a low rate limit (a handful of emails/hour) since custom SMTP isn't configured. Fine for now; revisit if it becomes a blocker (e.g. before real user signups at launch).

### Phase 3: Shared Comment System — COMPLETE
- [x] Create `comments` table in Supabase (linked to any post type by ID)
- [x] Build reusable comment list + comment form component
- [x] Test comments work generically before wiring into specific features

Notes:
- `<Comments testimonyId={id} path="/some/path" />` (or `prayerRequestId` / `checkinId`) in `src/components/comments.tsx` — pass exactly one parent id, matching the DB's `comments_exactly_one_parent` check constraint. `path` is passed to `revalidatePath` after posting, so pass whatever path is rendering the component.
- `comments.testimony_id` / `prayer_request_id` / `checkin_id` are plain uuid columns, not yet FKs — add the FK constraint for each when its real table is created in Phases 4-6 (see comment at top of `supabase/migrations/003_comments.sql`).
- Verified end-to-end via a temporary test page (now deleted): logged-in post + list, logged-out view-only (no form), author name joined in from `profiles`.

### Phase 4: Daily Testimony — COMPLETE
- [x] Create `testimonies` table (verse reference, verse text, context, date, author)
- [x] Build home page section that displays today's testimony
- [x] Build a simple form to post a new testimony (admin-only to start)
- [x] Wire in the shared comment system
- [x] Build an archive/history page to browse past testimonies

Notes:
- Posting is admin-gated (`/testimonies/new` redirects non-admins to `/`, logged-out to `/login`). Originally used a `profiles.is_admin` boolean; **superseded in Phase 7 by `profiles.role`** (`'member'` | `'admin'`) so testimonies and the Content Library share one admin model — see Phase 7 notes. Currently only `tyler+ootest2@ironshepherdsystems.com` is admin — re-bootstrap for the real admin account(s) once the new domains have real email addresses set up.
- Home page shows the latest testimony with `date <= today` (falls back gracefully to the most recent past one if nothing's posted for today yet, rather than showing nothing).
- Routes: `/` (today's), `/testimonies` (archive), `/testimonies/[id]` (full text + comments), `/testimonies/new` (admin post form).
- Verified end-to-end in browser: post as admin -> shows on home -> archive lists it -> detail page -> comment -> logged-out user redirected away from `/testimonies/new`.

### Phase 5: Prayer Request Board — COMPLETE
- [x] Create `prayer_requests` table (title, description, user_id, date)
- [x] Build the board/feed page (list of requests)
- [x] Build a "submit a prayer request" form
- [x] Wire in the shared comment system
- [x] Optional: add a "praying for this 🙏" reaction count

Notes:
- Unlike testimonies, any logged-in user can submit a prayer request (no admin gate) — RLS just checks `auth.uid() = user_id`.
- Reactions are a separate `prayer_reactions` table (one row per user per request, toggleable) rather than a counter column, so a user can only react once and can un-react.
- Gotcha hit: embedding `profiles(name)` on `prayer_requests` was ambiguous to PostgREST once `prayer_reactions` existed, because it creates a *second* path from `prayer_requests` to `profiles` (via `prayer_reactions.user_id`). Fixed by naming the FK explicitly: `profiles!prayer_requests_user_id_fkey(name)`. Worth remembering if a future embed on a table with multiple relationships to the same target silently returns null data — check for a swallowed `error` on the query first.
- Routes: `/prayers` (feed), `/prayers/[id]` (full text + reactions + comments), `/prayers/new` (submit form, any logged-in user).

### Phase 6: Daily Check-Ins — COMPLETE
- [x] Create `checkins` table (trained + note, prayed + note, scripture + note, user_id, date)
- [x] Build the check-in submission form (checkboxes + optional notes)
- [x] Build the check-in feed (card view showing badges + notes)
- [x] Wire in the shared comment system
- [x] Optional: build a simple streak counter per user

Notes:
- `checkins` has a `unique (user_id, date)` constraint; the submit form upserts on `user_id,date`, so re-checking in today edits today's row instead of creating a duplicate (verified in browser: updated Scripture on an existing check-in, feed still showed one card, badges updated).
- Streak logic (`src/lib/checkins/streak.ts`) counts consecutive days ending today, or ending yesterday if today isn't checked in yet (so the streak doesn't zero out mid-day before someone's checked in).
- Routes: `/checkins` (feed + streak), `/checkins/[id]` (full notes + comments), `/checkins/new` (submit/update today's).

### Phase 7: Content Library — COMPLETE
Replaces the earlier separate "Resources" and "Plans" ideas discussed with Tyler — folded into one feature, since a plan is really just a longer piece of browsable content, same as a book or sermon.
- [x] Create `resources` table (type, title, author, link, description, content, date)
- [x] Add `profiles.role` (`member`/`admin`), replacing `is_admin`
- [x] Content library page, filterable by type, plan cards link to a detail view, other types link out externally
- [x] Admin-only "add resource" form that adapts fields by type
- [x] Optional free-text "what are you working through" field on the check-in form

Notes:
- `008_admin_role` also updated the testimonies insert policy to check `role = 'admin'` instead of the old `is_admin` column, then dropped that column — testimonies and the Content Library now share one admin model. Tyler set his own account's `role` to `'admin'` via the Supabase table editor.
- Any current admin can add resources — no separate "owner" tier (matches how testimony-posting admin access already works).
- `working_on` on `checkins` is plain free text with no relational link to `resources` — deliberately simple, per Tyler. Shows on both the check-in feed card and detail page.
- Routes: `/resources` (filterable index), `/resources/[id]` (full content — mainly for plans), `/resources/new` (admin-only, type-adaptive form — a small client component since the field set changes based on a live `<select>`, everything else in the app is server-only).
- Verified end-to-end in browser: added a book (external link) and a plan (weekly breakdown), type filter works, plan links to its detail page with full content rendered, book links out externally, logged-out visitor redirected away from `/resources/new`, check-in "working through" field saves and displays on both feed and detail.

### Phase 8: Additional Features
Open-ended — Tyler gives these one at a time as separate prompts, don't try to guess what's coming next.
- [x] Build the Mission page (`/mission`) from `MISSION.md`: Why We Exist, Mission Statement, What We Believe, Where We're Starting — replaces the nav's placeholder "About" slot.
- [x] Add Cloudflare Turnstile bot/spam protection to sign-up and login
- [x] Widen `profiles.role` to allow a `partner` value
- [x] Admin moderation toolkit: delete any comment (with a notification email), restrict/ban members, admin members list with one-off custom emails
- [x] Contact Us page: public form (name/email/message), Turnstile-protected, stores to `contact_messages` and emails `tyler@ironshepherdsystems.com`
- [x] Public/member visibility layer across the app — see "Public vs member visibility model" section below for the reference model and how to extend it
- [x] Admins can't change another admin's status through the app — only Tyler, at the database level
- [x] Community Guidelines page (`/guidelines`) from `GUIDELINES.md`, linked from the site footer and the comment-removal notification email
- [x] Podcast page (`/podcast`): public listing with per-episode Spotify/Apple Podcasts/YouTube links, admin-only add form
- [x] Message Board (`/message-board`): public listing of admin-posted announcements, pinned posts first, with members-only comments

Notes:
- **Message Board**: `message_board_posts` table (`018_message_board.sql`) — title, body, `category` (defaults to `'general'`, no UI selector yet, same as Content Library's original single-type launch), `pinned` boolean, admin author, date. Same admin-manageable pattern as Charities/Podcast: public `/message-board` listing (pinned first, then newest), admin-only `/message-board/new` add form with a "Pin this post" checkbox, RLS viewable-by-everyone + insert-admin-only.
  - **New visibility pattern, distinct from the other three parent types**: the post itself is fully public (no redirect, no filtering), but its comment thread is members-only — logged-out visitors see the post body but no comments and no comment count. This is the first comments-enabled feature where the *post* and its *comments* have different visibility levels; testimonies/prayers/checkins gate the whole page, so their comments were never independently exposed to logged-out visitors even though the comments table's old RLS policy said "viewable by everyone."
  - Extended the shared `comments` table with a fourth parent column, `message_board_post_id` (`src/lib/comments/types.ts`'s `CommentParent`/`parentColumn` updated to a 4-way union — `Comments` component itself needed no changes, it's already generic over parent type). The blanket "Comments are viewable by everyone" RLS policy was replaced with one that keeps the other three parent types public (`message_board_post_id is null`) while requiring `auth.uid() is not null` specifically for message-board comments — enforced at the database level, not just by the page choosing not to render the `<Comments>` component for logged-out visitors (defense in depth, same reasoning as the admin-status-protection trigger).
  - `createMessageBoardPost` (`src/app/message-board/actions.ts`) checks the caller's `role = 'admin'` **inside the server action itself**, not just via the `/message-board/new` page's redirect. This surfaced a real pre-existing gap: `createTestimony`/`createResource`/`createCharity`/`createPodcastEpisode` only gated admin access at the page level, not inside the action — a logged-in non-admin could invoke those server actions directly, bypassing the UI entirely. **Fixed (2026-09-14)**: added the same in-action `profiles.role === 'admin'` check (redirecting to the same fallback each page already used — `/` for testimonies, `/resources`, `/charities`, `/podcast`) to all four. Verified with `npm run build` only; this isn't browser-testable by Claude since reproducing the actual exploit needs a logged-in non-admin session, and Turnstile blocks Claude's automated browser from logging in at all. Tyler can spot-check informally next time he's logged in as a non-admin test account, but isn't required to — the fix mirrors the already-proven `admin_get_profiles`/`requireAdmin` pattern from the admin moderation toolkit.
  - Comment count shown on the list page only when a user is logged in (`user && <p>{count} comments</p>`) — the underlying query always fetches the `comments(count)` aggregate for simplicity, but RLS means an anonymous request would get back 0 for every post regardless, so nothing leaks even before the app-level render check.
  - Added to the public nav (`src/components/nav-client.tsx`) right after Mission, alongside Mission/Content Library/Charities/Podcast/Contact per Tyler's spec.
  - Verified in browser (Claude, logged out only — Turnstile blocks any login-gated flow from Claude's automated browser): `/message-board` renders correctly on desktop and at 375×812 mobile, empty state ("No posts yet."), nav placement correct in both desktop and mobile hamburger menu, `/message-board/new` redirects logged-out visitors to `/login`, a nonexistent post id 404s correctly. **Still need Tyler to verify on the live site**: posting as admin (with and without "pin"), pinned sort-to-top behavior, the comment count appearing for logged-in users, commenting as a member, and confirming comments are truly invisible when logged out (and that a non-admin member doesn't see the "New post" button or can't reach `/message-board/new`).
- **Podcast page**: `podcast_episodes` table (`017_podcast_episodes.sql`) — title, publish date, three optional platform URLs (Spotify/Apple Podcasts/YouTube). Same admin-manageable pattern as Charities: public `/podcast` listing (newest first), admin-only `/podcast/new` add form, RLS viewable-by-everyone + insert-admin-only. Platform links render as small pill buttons with an emoji prefix (🎧/🍎/▶️) rather than a real icon set — no icon library exists in the app yet, and this stays consistent with the text-first UI used everywhere else rather than adding a new dependency for one page. Added to nav next to Charities. Verified in browser (empty-state render, nav placement, branding). Empty state says "Coming soon! Our first episode is on the way." — Tyler doesn't have an episode yet; **still need him to add the first real one and confirm the platform link buttons render correctly** once he does (the add-episode flow itself is admin-only/login-gated so Claude can't test it).
- **Community Guidelines page**: static content page (`src/app/guidelines/page.tsx`) from `GUIDELINES.md`, no database involved, content used as-is. First page to need a site footer — added `src/components/footer.tsx`, rendered in `layout.tsx` on every page (previously the app had no footer at all). Also linked from the comment-removal notification email (`src/lib/comments/actions.ts`'s `deleteComment`) via `${origin}/guidelines`, using the same `headers()`-derived-origin pattern as the sign-up confirmation email, since it needs an absolute URL. Verified in browser: content matches `GUIDELINES.md` exactly, footer link works and appears on every page. Tyler deleted a real test comment and confirmed the guidelines link in the actual removal email works correctly.
- **Admins can't change another admin's status**: `/admin/members/[id]` hides the status form entirely when the target is an admin (shows an explanatory note instead), and `updateMemberStatus` in `src/app/admin/members/actions.ts` refuses the update server-side too — both needed since a UI-only restriction doesn't stop a direct API call. Also extended `016_no_admin_status_changes.sql`'s trigger (the same one from `012_profile_email_and_status.sql` that already blocked self-escalation) so it silently reverts *any* attempt to change role/status on a row that's currently an admin, regardless of who's making the change — the true defense-in-depth layer, since it can't be bypassed by calling Supabase directly. Locking out or demoting an admin now requires Tyler running SQL directly (which runs as `postgres` and bypasses both RLS and this trigger). Verified by Tyler on the live site (viewing his own admin profile in `/admin/members` shows the explanatory note instead of the status controls) — Claude couldn't test this one itself, admin-only login-gated flow.
- **Public/member visibility layer**: full model documented in its own section below (search "Public vs member visibility model") since it's meant to be a standing reference for future pages, not a one-time note. Summary of what changed: `/testimonies` archive, `/testimonies/[id]`, `/checkins`, `/checkins/[id]`, and `/prayers/[id]` now redirect logged-out visitors to `/login` (previously public); `/prayers` branches to a count-only summary when logged out instead of redirecting; `/resources` and `/resources/[id]` filter out `plan`/`video` types for logged-out visitors instead of redirecting; new `/charities` page (public); nav branches on auth state. Tyler confirmed the logged-in experience (full nav, testimony archive, prayer board, check-ins, adding a charity) all still work correctly on the live site.
- **"Message board" interpretation — confirmed correct by Tyler**: comments (viewing and posting) require login everywhere, including on today's public testimony. Its full text still shows on the home page for everyone, but the "View & discuss" link/detail page is members-only like every other detail page.
- **Charities**: admin-manageable per Tyler, matching the Content Library pattern — `charities` table (`015_charities.sql`), public `/charities` listing, admin-only `/charities/new` add form (name, description, optional link). No edit/delete UI, same scope as resources today. RLS: viewable by everyone, insert admin-only. Copy deliberately says "partner with and/or support," not just "partner with" — Tyler plans to list charities regardless of formal partnership status.
- **Contact Us page** (`/contact`, public, no login required): stores every submission in `contact_messages` (admin-readable via RLS, though there's no browsing UI for it yet — it's durable backup storage in case the email gets lost, not a feature in itself) and sends a notification to `tyler@ironshepherdsystems.com` via Resend, best-effort (storage succeeds even if the email fails, same pattern as comment-removal notices).
  - This is the first Turnstile-protected form that **isn't** a Supabase Auth call — sign-up/login get their token verified by Supabase internally using the secret key Tyler gave Supabase directly, but a plain table insert has nothing verifying the token unless the app does it. Added `src/lib/turnstile.ts`'s `verifyTurnstileToken()`, which calls Cloudflare's `siteverify` API directly using a new `TURNSTILE_SECRET_KEY` env var (server-only, distinct from the `NEXT_PUBLIC_` site key) — `submitContactMessage` rejects the submission if this fails. Confirmed the secret key itself is valid via a one-off `node -e` script against Cloudflare's API before wiring it in (got back `invalid-input-response` for a deliberately fake token, not `invalid-input-secret`, meaning Cloudflare recognized the secret and only rejected the fake token as expected).
  - Any future Turnstile-protected form that doesn't go through Supabase Auth needs this same manual verification step — it's not automatic just because the widget is present.
  - Verified in browser: Claude's own automated submission was correctly rejected with "Verification failed" (proof the check is real, not cosmetic — same fundamental limitation as login, an agent can't generate a solved token). Tyler then submitted a real message on the live site and confirmed both the DB row and the notification email arrived.
- **Admin moderation toolkit**:
  - Schema (`012_profile_email_and_status.sql`, `013_admin_moderation.sql`): `profiles.email` (backfilled from `auth.users`, kept in sync via the signup trigger — added because the app has no service-role key to look up emails any other way) and `profiles.status` (`active`/`restricted`/`banned`). `admin_get_profiles()` is a `security definer` DB function that returns all profiles *including* email, but only when the caller is an admin (empty result otherwise) — needed because RLS is row-level, not column-level, so email had to be locked down with a column-level `revoke`/`grant` to keep it from being readable by anyone hitting the public API directly.
  - Found and fixed a real pre-existing gap while in here: the blanket `update` grant on `profiles` from Phase 2 let any logged-in user set their own `role`/`status` directly via the Supabase client, bypassing the UI entirely (RLS's "is this your own row" check doesn't restrict which columns). Closed with a `before update` trigger that force-reverts `role`/`status` to their prior values unless the caller is already an admin — more reliable here than RLS's `WITH CHECK`, which can't compare against the pre-update value.
  - Comment delete: admin-only DELETE policy on `comments`; a "Delete" link appears next to every comment (testimonies/prayers/check-ins all share `src/components/comments.tsx`) when the viewer is admin. Deleting sends the comment's author a short, generic "removed for violating community guidelines" email via Resend (`src/lib/email.ts`, from `noreply@operationobedience.org` — requires that domain verified in Resend, which I can't check myself) — the delete still succeeds even if the email send fails (best-effort, not blocking).
  - Enforcement: `banned` is checked in `src/lib/supabase/middleware.ts` on every request — signs the user out and redirects to `/login` with a message. `restricted` is checked at the top of every content-creation action (`addComment`, `createTestimony`, `createPrayerRequest`, `submitCheckin`, `createResource`) via `src/lib/moderation.ts`'s `isActiveUser`, redirecting back with an error message. Reactions (🙏) are deliberately *not* blocked for restricted users — Tyler's spec said "posting or commenting," reactions are a lighter interaction; flag if that should change.
  - Admin UI: `/admin/members` (list, admin-only) and `/admin/members/[id]` (status dropdown + one-off custom email form), linked from the nav as "Members" for admins.
  - **Verified by Tyler on the live site** (Claude's automated browser can't complete any login-gated flow now that Turnstile is enforced — see the Turnstile note below): comment delete + notification email, restricted blocking posting/commenting, banned signing the user out, and the admin one-off custom email all confirmed working.
  - **Deploy gotcha #1, fixed**: the first push of this feature broke Vercel's build with `Missing API key. Pass it to the constructor new Resend("re_123")`, even though `npm run build` was clean locally. Cause: `src/lib/email.ts` constructed `new Resend(...)` at module scope, and Next.js's build-time "page data collection" step evaluates route modules (transitively importing this one) without the same env access a real request gets — so it worked locally (`.env.local` has the key) but failed on Vercel. Fixed by constructing the client lazily inside `sendEmail()` instead of at module load. Confirmed the fix by building locally with `RESEND_API_KEY` temporarily removed from `.env.local` (reproduces the exact failure) and building again after restoring it. General lesson: never construct a third-party SDK client at module top-level scope in this app — always lazily, inside the function that uses it.
  - **Deploy gotcha #2**: `RESEND_API_KEY` had actually never been added to Vercel at all (despite Tyler's original task message saying it was) — the app's own try/catch around `sendEmail()` was masking the real "Missing API key" error behind a generic "Failed to send email" message. Fixed the error-swallowing (`src/app/admin/members/actions.ts`'s `sendMemberEmail` now includes the real error text in what it shows the admin) and diagnosed the actual key issue via a one-off local `node -e` script hitting the Resend API directly with the same key — confirmed the key/domain/recipient (including plus-aliases) all worked fine outside the app, which pointed straight at a Vercel env var scoping problem rather than a code or Resend account issue. Tyler added the key to Vercel and redeployed; confirmed working. Lesson: don't let a generic catch-and-redirect swallow the real error message in an admin-only surface — there's no user-facing harm in showing an admin the raw failure reason, and it's the difference between a two-minute diagnosis and guessing.
  - **Also found via testing, unrelated to this feature's code**: logging out and immediately trying to log back in in the same browser tab hit the same "no captcha token" error, requiring a full browser restart to clear. Cause: the Turnstile widget used *implicit* rendering (a plain `data-sitekey` div that Cloudflare's script auto-scans once, on the original hard page load) — but Next.js does client-side navigation after a server action's `redirect()`, so bouncing back to `/login` (from logout, or from the banned-user redirect) never re-triggered that scan, leaving the widget uninitialized and permanently token-less until a real page load happened. Fixed by switching `src/components/turnstile-widget.tsx` to a client component that explicitly calls `turnstile.render()` in a `useEffect`, which re-runs on every mount including soft navigation. Confirmed both the fix (widget re-initializes correctly after a client-side route change, verified via checking for the hidden response input locally) and Tyler's retest (logout → immediate re-login in the same tab now works).
  - **Also hit, self-resolved**: one push didn't trigger Vercel's auto-deploy at all (not a build failure — no deployment even started; confirmed the commit was on GitHub fine). Tyler triggered a manual "Redeploy" from the Vercel dashboard, which worked, and auto-deploy resumed working normally on the next push. Cause unknown/possibly transient (a webhook delivery glitch between GitHub's Vercel App and Vercel) — if it recurs, a manual redeploy from Vercel's dashboard is the workaround; full diagnosis would need Vercel-side delivery logs Tyler doesn't have visibility into as a repo collaborator (Vercel's own GitHub App, not a per-repo webhook).
- **`partner` role**: schema-only change (`011_partner_role.sql` widened the `profiles_role_check` constraint to `'member' | 'admin' | 'partner'`). Nothing in the app references it yet — reserved for a future Partnerships page/partner-specific views once there's a real partner. `role` still defaults to `'member'`.
- **Mission page**: static content page (`src/app/mission/page.tsx`), no database involved. Scripture quotations in "Why We Exist" are styled as set-apart blockquotes (border-l-2 border-ember, italic, muted text) per the formatting note in `MISSION.md`, not just inline italics. "What We Believe"'s inline verse citations use italic ember text instead of full blockquotes, since five short numbered beliefs each with their own blockquote would be visually heavy — this wasn't explicitly specified so it's a judgment call, flag if you'd rather those be blockquotes too. Nav link added as "Mission" (there was no pre-existing "About" link/page to literally replace — Phase 9's "About" checklist item is superseded by this). Verified in browser end-to-end, matches `MISSION.md` content and section order exactly.
- **Turnstile**: added to both sign-up and login, not just sign-up — Supabase's "Bot and Abuse Protection" is a project-wide Auth setting, so once Tyler enabled it, *every* password-based auth call requires a valid `captcha_token`, not just sign-up. Confirmed this the hard way: sign-up failed with `captcha protection: request disallowed (no captcha_token found)` before login's widget was added and tested.
  - `src/components/turnstile-widget.tsx`: renders Cloudflare's Managed widget with `appearance: "interaction-only"` — invisible with no reserved layout space for most visitors, only expands into a visible challenge when Cloudflare's risk signals call for one. Deliberately not the older "Invisible Widget Type," which Cloudflare now discourages in favor of this.
  - **Explicit rendering, not implicit**: a client component that calls `turnstile.render()` itself in a `useEffect`, rather than a plain `data-sitekey` div relying on the script's one-time auto-scan. Needed because Next.js does client-side navigation after a server action's `redirect()` — the implicit approach left the widget uninitialized (and thus permanently token-less) after any soft-navigated return to `/login` (logout, or the banned-user redirect). See the Phase 8 admin-moderation-toolkit notes above for the full story; fixed there since that's where it surfaced.
  - The widget still injects its own hidden `cf-turnstile-response` input, which rides along in the surrounding `<form>`'s FormData automatically — no other custom form-handling needed. `src/app/auth/actions.ts`'s `login`/`signup` read `formData.get("cf-turnstile-response")` and pass it as `options.captchaToken` to `signInWithPassword`/`signUp`, per Supabase's documented approach.
  - Claude's automated browser cannot complete any login-gated flow now that this is enforced (correctly — that's the point). Every login-gated feature from here on needs Tyler to verify interactively on the live site; Claude verifies what it can via `npm run build` and logged-out/redirect behavior only.

### Phase 9: Polish & Launch Prep — mostly COMPLETE
- [x] Build a simple nav bar / mobile-friendly layout
- [x] Add a basic "About Operation Obedience" page — built early as the Mission page, see Phase 8
- [x] Add basic error handling (empty states, loading states)
- [x] Test full flow on an actual phone browser — Tyler checked `operationobedience.org` on his phone, confirmed it looks good
- [ ] Invite a small group of test users (5–10 guys) before wider launch — Tyler's own outreach action

Notes on the full polish pass (2026-09-13):
- **Nav**: `src/components/nav.tsx` split into a server component (fetches user/role) and a new `src/components/nav-client.tsx` (renders the actual UI) — the old single component had no mobile treatment at all. The client component now has a working hamburger menu (`useState` toggle) below the `md` breakpoint; desktop keeps the existing horizontal link row (`hidden md:flex`). Verified in-browser at 375×812: hamburger opens/closes, logged-out link set matches spec exactly (Mission, Content Library, Charities, Podcast, Contact, Log in, Sign up), Community Guidelines confirmed linked from the footer (`src/components/footer.tsx`, unchanged, already correct).
- **Visibility re-verification**: walked every route (`/`, `/resources`, `/prayers`, `/testimonies`, `/checkins`, `/charities`, `/podcast`, `/contact`, `/profile`, `/admin/members(/[id])`) added since the original visibility-layer work, including the newer Charities and Podcast pages. All correctly split: logged-out visitors get Mission, today's testimony only (no archive link), book/sermon/article only in the Content Library (`PUBLIC_RESOURCE_TYPES` filter), a prayer-count teaser only (no board), Charities and Podcast in full (intentionally public), Contact, and nothing else — every member/admin route still redirects logged-out visitors to `/login`. No regressions found; no changes needed here.
- **Error/empty states audit**: found and fixed two real silent-failure gaps — `addComment`/`deleteComment` in `src/lib/comments/actions.ts` previously only `console.error`'d on insert/delete failure with zero user feedback; now redirect with a `comment_error` query param, which the existing `Comments` component/parent pages already knew how to render as a red banner. `toggleReaction` in `src/app/prayers/actions.ts` didn't check its `.delete()`/`.insert()` results at all; now logs on error (a reaction toggle failing silently just leaves the button state stale, not worth a redirect/banner for this one). Every other server action (`testimonies`, `checkins`, `resources`, `charities`, `podcast`, `contact`, `admin/members`, `profile`) was already redirecting with `?error=` on failure — no changes needed. Every list page already had a sensible empty state (e.g. "No prayer requests yet.") — no gaps found.
- **Loading states**: none existed anywhere. Added one root `src/app/loading.tsx` (+ shared `src/components/loading-spinner.tsx`) rather than one per route — Next's `loading.tsx` convention wraps a segment and everything below it that doesn't have its own, so a single root file gives every route a fallback while only replacing the page content (`{children}` in `layout.tsx`), not the persistent Nav/Footer.
- **Domain check**: added `src/lib/site.ts` exporting `SITE_URL` (reads `NEXT_PUBLIC_SITE_URL`, falls back to a hardcoded default), and switched the comment-removal email's guidelines link to use it instead of a request-derived origin — deliberately *not* changed for auth redirects (`src/app/auth/actions.ts`'s `emailRedirectTo`), which correctly stay origin-derived so local dev and preview deploys keep working. Grepped the whole repo for other `vercel.app` references — none found outside this file. Tyler confirmed `operationobedience.org` is live and working (checked on his phone, see below), so the fallback in `site.ts` was updated from `operation-obedience.vercel.app` to `https://operationobedience.org`. `NEXT_PUBLIC_SITE_URL` still isn't set in Vercel — not urgent now that the hardcoded fallback is correct, but setting it there would avoid a code change if the canonical domain ever changes again.
- **Mobile responsiveness**: spot-checked home, Content Library, Contact, and the new nav at 375×812 in-browser — all render cleanly with the existing `max-w-*` + `px-6` single-column convention used consistently across every page. Didn't find layout breakage anywhere; a full walk of every remaining page wasn't done pixel-by-pixel, so flag anything that looks off on a real phone (see the open checklist item above).

## Incident: Turnstile "no captcha token" on the new custom domain (fixed 2026-09-14)
**What happened**: the day after `operationobedience.org` went live, Tyler couldn't log in from either his phone or his work laptop — both hit "no captcha token" on submit, the same error message as the earlier same-tab-relogin bug from Phase 8, but this time on a fresh page load, not a soft navigation, and reproducible on two unrelated devices.

**Root cause**: Cloudflare Turnstile widgets are locked to an allowed-domains list configured per site key in the Cloudflare dashboard. The widget's site key had only ever been configured for `operation-obedience.vercel.app` (the only domain anyone had used to test login before now — see "Local dev environment notes"). On `operationobedience.org` the widget refused to render/solve at all, so the form always submitted with an empty token. Confirmed via the browser console: `Uncaught TurnstileError: [Cloudflare Turnstile] Error: 110200` — Cloudflare's specific code for "domain not allowed for this sitekey."

**Fix**: Tyler added `operationobedience.org` to the widget's allowed-domains list in the Cloudflare dashboard (Turnstile settings, not something Claude can access). No code or redeploy needed — took effect immediately. Confirmed fixed by Tyler logging in successfully on the live site afterward.

**Note for next time**: any Turnstile-protected form (login, sign-up, contact) will fail this same way on *any* new hostname the app is ever reachable at — a new custom domain, a `www.` variant, a Vercel preview URL someone tests against, etc. — until that hostname is added to the Cloudflare widget's domain allowlist. This is a dashboard config step, not something a code change can fix.

## Later / Not MVP
- [ ] Group chat feature
- [ ] Donate button (hold until entity structure — nonprofit vs LLC — is decided)
- [ ] Native app wrapper via Capacitor
- [ ] Fitness partner directory / "community partners" page
- [ ] Accountability pods / partner matching

## Where Make.com could fit (optional, later — not needed for MVP)
Tyler has a Make.com account. Best used for automations *around* the app, not the app itself, once the MVP is live:
- [ ] Email/SMS notification when someone comments on a prayer request
- [ ] Weekly digest email of testimonies + check-in streaks
- [ ] Auto-posting new testimonies to a Facebook/Instagram page
- [ ] Syncing new sign-ups to a mailing list (Mailchimp, etc.)
