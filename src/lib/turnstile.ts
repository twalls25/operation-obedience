// Server-side verification against Cloudflare's siteverify API. Needed
// anywhere Turnstile protects a form that doesn't go through Supabase Auth
// (which does its own verification internally using its own configured
// secret) — e.g. the public contact form, a plain table insert.
export async function verifyTurnstileToken(token: string) {
  if (!token) return false;

  const body = new URLSearchParams();
  body.append("secret", process.env.TURNSTILE_SECRET_KEY!);
  body.append("response", token);

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body }
  );

  const data = await res.json();
  return data.success === true;
}
