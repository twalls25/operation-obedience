"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavGroup } from "@/lib/nav-links";

export function NavGroups({
  groups,
  onNavigate,
}: {
  groups: NavGroup[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  // Longest matching href wins, so /testimonies/new highlights "Post
  // devotional" rather than also lighting up "Devotionals".
  const activeHref = groups
    .flatMap((g) => g.links.map((l) => l.href))
    .filter((href) => pathname === href || pathname.startsWith(href + "/"))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.heading}>
          <p
            className={`px-3 pb-1 text-xs ${group.admin ? "text-ember" : "text-muted"}`}
          >
            {group.heading}
          </p>
          <ul className="flex flex-col">
            {group.links.map((link) => {
              const active = link.href === activeHref;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`block border-l-2 px-3 py-1.5 text-sm ${
                      active
                        ? "border-ember bg-panel text-ember"
                        : "border-transparent text-offwhite hover:bg-panel/60"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
