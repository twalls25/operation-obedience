import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { toggleReaction } from "./actions";

export default async function PrayersPage() {
  const supabase = await createClient();

  const [{ data: requests }, { data: { user } }] = await Promise.all([
    supabase
      .from("prayer_requests")
      .select(
        "id, title, date, profiles!prayer_requests_user_id_fkey(name), prayer_reactions(count)"
      )
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  let reactedIds = new Set<string>();
  if (user) {
    const { data: myReactions } = await supabase
      .from("prayer_reactions")
      .select("prayer_request_id")
      .eq("user_id", user.id);
    reactedIds = new Set(myReactions?.map((r) => r.prayer_request_id));
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-offwhite">Prayer requests</h1>
        <Link
          href="/prayers/new"
          className="rounded-md bg-ember px-4 py-2 text-sm font-medium text-charcoal hover:bg-ember/90"
        >
          Submit a request
        </Link>
      </div>

      <ul className="mt-6 flex flex-col gap-4">
        {requests?.length ? (
          requests.map((request) => {
            const reacted = reactedIds.has(request.id);
            const count = request.prayer_reactions?.[0]?.count ?? 0;

            return (
              <li
                key={request.id}
                className="rounded-md border border-panel bg-panel/40 p-4"
              >
                <Link
                  href={`/prayers/${request.id}`}
                  className="font-medium text-offwhite hover:underline"
                >
                  {request.title}
                </Link>
                <p className="text-sm text-muted">
                  {request.date} · {request.profiles?.name ?? "A brother"}
                </p>

                <form
                  action={toggleReaction.bind(null, request.id, "/prayers")}
                  className="mt-3"
                >
                  <button
                    type="submit"
                    className={`rounded-full border px-3 py-1 text-sm ${
                      reacted
                        ? "border-ember bg-ember text-charcoal"
                        : "border-panel text-muted hover:text-offwhite"
                    }`}
                  >
                    🙏 {count} praying
                  </button>
                </form>
              </li>
            );
          })
        ) : (
          <p className="text-sm text-muted">No prayer requests yet.</p>
        )}
      </ul>
    </main>
  );
}
