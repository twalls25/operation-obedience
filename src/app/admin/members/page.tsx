import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type MemberRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  status: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
};

const INACTIVE_DAYS = 60;

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "banned"
      ? "border-red-900 text-red-300"
      : status === "restricted"
        ? "border-ember text-ember"
        : "border-panel text-muted";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs ${color}`}>
      {status}
    </span>
  );
}

function FilterLink({
  active,
  href,
  children,
}: {
  active: boolean;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 text-sm ${
        active
          ? "border-ember bg-ember text-charcoal"
          : "border-panel text-muted hover:text-offwhite"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; deleted?: string }>;
}) {
  const { filter, deleted } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  const { data } = await supabase
    .rpc("admin_get_profiles")
    .order("created_at", { ascending: false });
  const members = (data as MemberRow[] | null) ?? [];

  // Filters only list accounts that can actually be deleted (never admins).
  const cutoff = Date.now() - INACTIVE_DAYS * 24 * 60 * 60 * 1000;
  const isInactive = (m: MemberRow) =>
    !m.last_sign_in_at || new Date(m.last_sign_in_at).getTime() < cutoff;

  const visible =
    filter === "inactive"
      ? members.filter((m) => m.role !== "admin" && isInactive(m))
      : filter === "unconfirmed"
        ? members.filter((m) => m.role !== "admin" && !m.email_confirmed_at)
        : members;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-offwhite">Members</h1>
        <Link href="/admin/log" className="text-sm text-ember hover:underline">
          Moderation log
        </Link>
      </div>

      {deleted && (
        <p className="mt-4 rounded-md border-l-2 border-ember bg-panel px-3 py-2 text-sm text-offwhite">
          Account deleted.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <FilterLink active={!filter} href="/admin/members">
          All
        </FilterLink>
        <FilterLink active={filter === "inactive"} href="/admin/members?filter=inactive">
          Inactive {INACTIVE_DAYS}+ days
        </FilterLink>
        <FilterLink
          active={filter === "unconfirmed"}
          href="/admin/members?filter=unconfirmed"
        >
          Email not confirmed
        </FilterLink>
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {visible.length ? (
          visible.map((member) => (
            <li key={member.id}>
              <Link
                href={`/admin/members/${member.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-panel bg-panel/40 p-3 hover:bg-panel/70"
              >
                <div className="min-w-0">
                  <p className="font-medium text-offwhite">
                    {member.name ?? "A brother"}
                  </p>
                  <p className="break-all text-sm text-muted">{member.email}</p>
                  <p className="text-xs text-muted">
                    {member.last_sign_in_at
                      ? `Last sign-in ${new Date(member.last_sign_in_at).toLocaleDateString()}`
                      : "Never signed in"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {member.role === "admin" && (
                    <span className="rounded-full border border-ember px-2 py-0.5 text-xs text-ember">
                      admin
                    </span>
                  )}
                  {!member.email_confirmed_at && (
                    <span className="rounded-full border border-panel px-2 py-0.5 text-xs text-muted">
                      unconfirmed
                    </span>
                  )}
                  <StatusBadge status={member.status} />
                </div>
              </Link>
            </li>
          ))
        ) : (
          <p className="text-sm text-muted">
            {filter ? "No members match this filter." : "No members yet."}
          </p>
        )}
      </ul>
    </main>
  );
}
