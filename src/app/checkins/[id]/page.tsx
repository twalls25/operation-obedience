import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Comments } from "@/components/comments";

function CheckinItem({
  label,
  done,
  note,
}: {
  label: string;
  done: boolean;
  note: string | null;
}) {
  return (
    <div className="rounded-md border border-panel bg-panel/40 p-3">
      <p className="font-medium text-offwhite">
        {done ? "✅" : "⬜"} {label}
      </p>
      {note && (
        <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{note}</p>
      )}
    </div>
  );
}

export default async function CheckinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: checkin } = await supabase
    .from("checkins")
    .select(
      "id, date, trained, trained_note, prayed, prayed_note, scripture, scripture_note, working_on, profiles(name)"
    )
    .eq("id", id)
    .single();

  if (!checkin) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-sm text-muted">
        {checkin.date} · {checkin.profiles?.name ?? "A brother"}
      </p>
      <h1 className="mt-1 text-2xl font-bold text-offwhite">Daily check-in</h1>

      <div className="mt-4 flex flex-col gap-3">
        <CheckinItem label="Trained" done={checkin.trained} note={checkin.trained_note} />
        <CheckinItem label="Prayed" done={checkin.prayed} note={checkin.prayed_note} />
        <CheckinItem
          label="Read Scripture"
          done={checkin.scripture}
          note={checkin.scripture_note}
        />
      </div>

      {checkin.working_on && (
        <p className="mt-4 text-sm text-muted">
          Working through: <span className="text-ember">{checkin.working_on}</span>
        </p>
      )}

      <Comments checkinId={checkin.id} path={`/checkins/${checkin.id}`} />
    </main>
  );
}
