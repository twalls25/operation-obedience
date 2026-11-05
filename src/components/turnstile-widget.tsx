"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { turnstileState } from "@/lib/turnstile-state";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: Record<string, unknown>
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
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
//
// Readiness is published through turnstileState so CaptchaSubmitButton can
// stay disabled until a token exists. Tokens are single-use, so the widget
// is reset every time its form is submitted: a retry after a failed attempt
// (e.g. a wrong password, which re-renders the page without remounting the
// widget) gets a fresh token instead of the spent one.
export function TurnstileWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  // Without this the widget fails silently (blocked script, failed challenge)
  // and the form just submits with no token and a confusing error.
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    turnstileState.set(false);

    let widgetId: string | null = null;
    let interval: ReturnType<typeof setInterval> | undefined;
    let form: HTMLFormElement | null = null;

    // Runs before React's own submit handler has finished, so the reset is
    // deferred until after React has read the form data (token included).
    const onSubmit = () => {
      turnstileState.set(false);
      setTimeout(() => {
        if (widgetId && window.turnstile) window.turnstile.reset(widgetId);
      }, 0);
    };

    function renderWidget() {
      if (!containerRef.current || !window.turnstile) return;
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        theme: "dark",
        appearance: "interaction-only",
        callback: () => {
          setErrorCode(null);
          turnstileState.set(true);
        },
        "expired-callback": () => turnstileState.set(false),
        "error-callback": (code: string) => {
          turnstileState.set(false);
          setErrorCode(String(code));
          return true;
        },
      });
      form = containerRef.current.closest("form");
      form?.addEventListener("submit", onSubmit);
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          interval = undefined;
          renderWidget();
        }
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
      form?.removeEventListener("submit", onSubmit);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
      turnstileState.set(false);
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
