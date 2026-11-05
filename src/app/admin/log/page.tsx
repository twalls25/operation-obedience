import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type LogRow = {
  id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  note: string | null;
  created_at: string;
  profiles: { name: string | null } | null;
};

export default async function ModerationLogPage() {
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

  const { data: entries, error } = await supabase
    .from("moderation_log")
    .select("id, action, target_type, target_id, note, created_at, profiles(name)")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<LogRow[]>();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-offwhite">Moderation log</h1>
        <Link href="/admin/members" className="text-sm text-ember hover:underline">
          Members
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted">
        Every staff moderation action, newest first (last 100). Read-only.
      </p>

      {error && (
        <p className="mt-4 rounded-md border border-red-900 bg-red-950/60 px-3 py-2 text-sm text-red-300">
          Could not load the log: {error.message}
        </p>
      )}

      <ul className="mt-6 flex flex-col gap-3">
        {entries?.length ? (
          entries.map((entry) => (
            <li
              key={entry.id}
              className="rounded-md border border-panel bg-panel/40 p-3 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-ember">{entry.action}</p>
                <p className="text-xs text-muted">
                  {new Date(entry.created_at).toLocaleString()}
                </p>
              </div>
              <p className="mt-1 text-offwhite">
                {entry.profiles?.name ?? "An admin"} · {entry.target_type}
                {entry.target_id && (
                  <span className="text-muted"> · {entry.target_id.slice(0, 8)}</span>
                )}
              </p>
              {entry.note && (
                <p className="mt-1 break-words text-muted">{entry.note}</p>
              )}
            </li>
          ))
        ) : (
          <p className="text-sm text-muted">No moderation actions yet.</p>
        )}
      </ul>
    </main>
  );
}
