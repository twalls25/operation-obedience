// Canonical site URL for links inside emails and other contexts where the
// link must always point somewhere real regardless of which domain an
// admin happens to be browsing from when they trigger the action (unlike
// auth redirects, which correctly derive from the request's own origin so
// local dev / preview deploys keep working).
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://operationobedience.org";
