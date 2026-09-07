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

## Local dev environment notes
- Tyler's machine has network-level TLS inspection (security software) that Node doesn't trust by default, causing `fetch failed` / `unable to verify the first certificate` errors on any outbound HTTPS call from the dev server (e.g. to Supabase) — but not from plain `node -e` scripts run outside the dev server process. Fixed by running `next dev` with `NODE_OPTIONS=--use-system-ca` (see the `dev` script in `package.json`, using `cross-env` for cross-platform env vars) so Node trusts the same root CA store Windows does. If a similar "fetch failed" error resurfaces, check this first before assuming it's a Supabase config issue.

## Shared architecture note
Testimonies, prayer requests, and check-ins all share one reusable comments system — a single `comments` table linked by post ID to `testimony_id` / `prayer_request_id` / `checkin_id`. Build the comment component generically once, then wire it into each feature, rather than building separate comment systems per feature.

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
- `profiles.is_admin` gates posting (`/testimonies/new` redirects non-admins to `/`, logged-out to `/login`). Currently only `tyler+ootest2@ironshepherdsystems.com` is admin (see `005_bootstrap_admin.sql`) — re-run that migration for the real admin account(s) once the new domains have real email addresses set up.
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

### Phase 6: Daily Check-Ins
- [ ] Create `checkins` table (trained + note, prayed + note, scripture + note, user_id, date)
- [ ] Build the check-in submission form (checkboxes + optional notes)
- [ ] Build the check-in feed (card view showing badges + notes)
- [ ] Wire in the shared comment system
- [ ] Optional: build a simple streak counter per user

### Phase 7: Polish & Launch Prep
- [ ] Build a simple nav bar / mobile-friendly layout
- [ ] Add a basic "About Operation Obedience" page
- [ ] Add basic error handling (empty states, loading states)
- [ ] Test full flow on an actual phone browser
- [ ] Invite a small group of test users (5–10 guys) before wider launch

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
