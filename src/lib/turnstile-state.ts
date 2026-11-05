// Tiny shared flag: "does the Turnstile widget currently hold a usable token?"
// The widget writes it; CaptchaSubmitButton reads it. Module-level so the two
// client components can talk without a provider; the widget resets it to
// false on every mount and unmount so a stale `true` from an earlier page
// can never leak into a new form.
let ready = false;
const listeners = new Set<() => void>();

export const turnstileState = {
  get: () => ready,
  set(value: boolean) {
    if (ready === value) return;
    ready = value;
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
