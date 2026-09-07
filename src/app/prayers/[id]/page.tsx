import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Comments } from "@/components/comments";
import { toggleReaction } from "../actions";

export default async function PrayerRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: request }, { data: { user } }] = await Promise.all([
    supabase
      .from("prayer_requests")
      .select(
        "id, title, description, date, profiles!prayer_requests_user_id_fkey(name), prayer_reactions(count)"
      )
      .eq("id", id)
      .single(),
    supabase.auth.getUser(),
  ]);

  if (!request) {
    notFound();
  }

  let reacted = false;
  if (user) {
    const { data: existing } = await supabase
      .from("prayer_reactions")
      .select("user_id")
      .eq("prayer_request_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    reacted = !!existing;
  }

  const count = request.prayer_reactions?.[0]?.count ?? 0;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-sm text-muted">
        {request.date} · {request.profiles?.name ?? "A brother"}
      </p>
      <h1 className="mt-1 text-2xl font-bold text-offwhite">{request.title}</h1>
      <p className="mt-4 whitespace-pre-wrap text-offwhite">{request.description}</p>

      <form
        action={toggleReaction.bind(null, request.id, `/prayers/${request.id}`)}
        className="mt-4"
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

      <Comments prayerRequestId={request.id} path={`/prayers/${request.id}`} />
    </main>
  );
}
