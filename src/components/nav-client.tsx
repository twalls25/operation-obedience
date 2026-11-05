"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "@/app/auth/actions";
import { memberGroups, publicLinks } from "@/lib/nav-links";
import { NavGroups } from "./nav-groups";

type Props = {
  userEmail: string | null;
  displayName: string | null;
  isAdmin: boolean;
};

export function NavClient({ userEmail, displayName, isAdmin }: Props) {
  const [open, setOpen] = useState(false);

  // Close the drawer when the login state flips (logout/login). Not done via
  // onClick on the Log out button: closing unmounts the drawer's <form> during
  // the tap, before the browser submits it, so logout silently did nothing.
  const [prevUserEmail, setPrevUserEmail] = useState(userEmail);
  if (prevUserEmail !== userEmail) {
    setPrevUserEmail(userEmail);
    setOpen(false);
  }

  const close = () => setOpen(false);
  const loggedIn = userEmail !== null;
  const label = displayName || userEmail || "";
  const initial = label.trim().charAt(0).toUpperCase() || "?";

  return (
    <nav className="border-b border-panel bg-panel px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center" onClick={close}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Operation Obedience" className="h-14 w-auto" />
        </Link>

        {!loggedIn && (
          <div className="hidden flex-wrap items-center gap-5 md:flex">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-ember hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <div className="hidden items-center gap-4 text-sm md:flex">
          {loggedIn ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 text-offwhite hover:underline"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ember text-sm font-medium text-charcoal">
                  {initial}
                </span>
                <span className="max-w-[12rem] truncate">{label}</span>
              </Link>
              <form action={logout}>
                <button type="submit" className="text-muted hover:text-offwhite">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-offwhite hover:underline">
                Log in
              </Link>
              <Link href="/signup" className="text-ember hover:underline">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="text-2xl text-offwhite md:hidden"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="mt-4 flex flex-col gap-4 border-t border-panel pt-4 md:hidden">
          {loggedIn ? (
            <NavGroups groups={memberGroups(isAdmin)} onNavigate={close} />
          ) : (
            publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-ember"
                onClick={close}
              >
                {link.label}
              </Link>
            ))
          )}

          <div className="flex flex-col gap-3 border-t border-panel pt-3 text-sm">
            {loggedIn ? (
              <>
                <Link href="/profile" className="text-offwhite" onClick={close}>
                  {label}
                </Link>
                <form action={logout}>
                  <button type="submit" className="text-left text-muted">
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="text-offwhite" onClick={close}>
                  Log in
                </Link>
                <Link href="/signup" className="text-ember" onClick={close}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
