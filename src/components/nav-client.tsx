"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "@/app/auth/actions";

type Props = {
  userEmail: string | null;
  isAdmin: boolean;
};

export function NavClient({ userEmail, isAdmin }: Props) {
  const [open, setOpen] = useState(false);

  const links: { href: string; label: string }[] = [
    { href: "/mission", label: "Mission" },
    ...(userEmail
      ? [
          { href: "/testimonies", label: "Testimonies" },
          { href: "/prayers", label: "Prayer Requests" },
          { href: "/checkins", label: "Check-Ins" },
        ]
      : []),
    { href: "/resources", label: "Content Library" },
    { href: "/charities", label: "Charities" },
    { href: "/podcast", label: "Podcast" },
    { href: "/contact", label: "Contact" },
    ...(isAdmin
      ? [
          { href: "/testimonies/new", label: "Post testimony" },
          { href: "/admin/members", label: "Members" },
        ]
      : []),
  ];

  const close = () => setOpen(false);

  return (
    <nav className="border-b border-panel bg-panel px-6 py-3">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center" onClick={close}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Operation Obedience" className="h-14 w-auto" />
        </Link>

        <div className="hidden flex-wrap items-center gap-5 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ember hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 text-sm md:flex">
          {userEmail ? (
            <>
              <Link href="/profile" className="text-offwhite hover:underline">
                {userEmail}
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
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ember"
              onClick={close}
            >
              {link.label}
            </Link>
          ))}

          <div className="flex flex-col gap-3 border-t border-panel pt-3 text-sm">
            {userEmail ? (
              <>
                <Link href="/profile" className="text-offwhite" onClick={close}>
                  {userEmail}
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="text-left text-muted"
                    onClick={close}
                  >
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
