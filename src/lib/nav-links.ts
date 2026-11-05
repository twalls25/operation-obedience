export type NavLink = { href: string; label: string };
export type NavGroup = { heading: string; links: NavLink[]; admin?: boolean };

// Top-bar links for logged-out visitors.
export const publicLinks: NavLink[] = [
  { href: "/mission", label: "Mission" },
  { href: "/message-board", label: "Message Board" },
  { href: "/resources", label: "Content Library" },
  { href: "/charities", label: "Charities" },
  { href: "/podcast", label: "Podcast" },
  { href: "/contact", label: "Contact" },
];

// Sidebar (desktop) and drawer (mobile) groups for logged-in members.
// Add new pages here — this is the one place nav links are defined.
export function memberGroups(isAdmin: boolean): NavGroup[] {
  return [
    {
      heading: "Daily",
      links: [
        { href: "/testimonies", label: "Devotionals" },
        { href: "/checkins", label: "Check-ins" },
        { href: "/prayers", label: "Prayer requests" },
      ],
    },
    {
      heading: "Community",
      links: [{ href: "/message-board", label: "Message board" }],
    },
    {
      heading: "Library",
      links: [
        { href: "/resources", label: "Content library" },
        { href: "/podcast", label: "Podcast" },
        { href: "/charities", label: "Charities" },
      ],
    },
    {
      heading: "About",
      links: [
        { href: "/mission", label: "Mission" },
        { href: "/contact", label: "Contact" },
      ],
    },
    ...(isAdmin
      ? [
          {
            heading: "Admin",
            admin: true,
            links: [
              { href: "/testimonies/new", label: "Post devotional" },
              { href: "/admin/members", label: "Members" },
              { href: "/admin/log", label: "Moderation log" },
            ],
          },
        ]
      : []),
  ];
}
