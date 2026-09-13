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
};

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

export default async function AdminMembersPage() {
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
  const members = data as MemberRow[] | null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold text-offwhite">Members</h1>

      <ul className="mt-6 flex flex-col gap-3">
        {members?.length ? (
          members.map((member) => (
            <li key={member.id}>
              <Link
                href={`/admin/members/${member.id}`}
                className="flex items-center justify-between rounded-md border border-panel bg-panel/40 p-3 hover:bg-panel/70"
              >
                <div>
                  <p className="font-medium text-offwhite">
                    {member.name ?? "A brother"}
                  </p>
                  <p className="text-sm text-muted">{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {member.role === "admin" && (
                    <span className="rounded-full border border-ember px-2 py-0.5 text-xs text-ember">
                      admin
                    </span>
                  )}
                  <StatusBadge status={member.status} />
                </div>
              </Link>
            </li>
          ))
        ) : (
          <p className="text-sm text-muted">No members yet.</p>
        )}
      </ul>
    </main>
  );
}
