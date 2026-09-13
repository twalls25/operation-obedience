import Script from "next/script";

// Cloudflare Turnstile, Managed widget with `interaction-only` appearance:
// no visible UI or reserved space for most users, only appears when
// Cloudflare's risk signals call for an interactive challenge. On submit,
// the widget's own hidden input (name="cf-turnstile-response") rides along
// in the form's FormData automatically, as long as this sits inside a
// <form> — no client-side JS/state needed on our end.
export function TurnstileWidget() {
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div
        className="cf-turnstile"
        data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        data-theme="dark"
        data-appearance="interaction-only"
      />
    </>
  );
}
