"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { turnstileState } from "@/lib/turnstile-state";

type Props = {
  formAction: (formData: FormData) => void | Promise<void>;
  className?: string;
  children: React.ReactNode;
};

// Submit button for Turnstile-protected forms. Stays disabled until the
// security check has produced a token, so people can't submit a few seconds
// too early and hit the "check hasn't finished" error.
export function CaptchaSubmitButton({ formAction, className, children }: Props) {
  const ready = useSyncExternalStore(
    turnstileState.subscribe,
    turnstileState.get,
    () => false
  );

  // Safety valve: if the check never reports in (and never reports an error),
  // don't leave the form permanently unusable. The server still rejects a
  // missing token with a plain-English message.
  const [waitedTooLong, setWaitedTooLong] = useState(false);
  useEffect(() => {
    if (ready) {
      setWaitedTooLong(false);
      return;
    }
    const timer = setTimeout(() => setWaitedTooLong(true), 15000);
    return () => clearTimeout(timer);
  }, [ready]);

  const enabled = ready || waitedTooLong;

  return (
    <button
      formAction={formAction}
      disabled={!enabled}
      className={`${className ?? ""} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {enabled ? children : "Checking you're human…"}
    </button>
  );
}
