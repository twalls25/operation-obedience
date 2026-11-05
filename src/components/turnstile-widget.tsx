"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: Record<string, unknown>
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

// Cloudflare Turnstile, Managed widget with `appearance: "interaction-only"`:
// no visible UI or reserved space for most visitors, only appears when
// Cloudflare's risk signals call for an interactive challenge.
//
// Explicit render (not the implicit `data-sitekey` div + auto-scan) because
// Next.js does client-side navigation after a server action's redirect()
// rather than a full page reload — e.g. logging out, or a banned user
// getting bounced back to /login. The api.js script only auto-scans for
// widgets once, on the original hard page load, so a soft-navigated-back
// login page would otherwise have an uninitialized widget that never
// produces a token. Rendering explicitly in a useEffect re-runs on every
// mount, so it works after soft navigation too.
export function TurnstileWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  // Without this the widget fails silently (blocked script, failed challenge)
  // and the form just submits with no token and a confusing error.
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    function renderWidget() {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        theme: "dark",
        appearance: "interaction-only",
        callback: () => setErrorCode(null),
        "error-callback": (code: string) => {
          setErrorCode(String(code));
          return true;
        },
      });
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          renderWidget();
        }
      }, 100);
      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, []);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onError={() => setErrorCode("script-blocked")}
      />
      <div ref={containerRef} />
      {errorCode && (
        <p role="alert" className="text-sm text-red-300">
          The security check couldn&apos;t load (code {errorCode}). Refresh the
          page, try a private window, or turn off extensions and tracking
          protection that block scripts on this site.
        </p>
      )}
    </>
  );
}
