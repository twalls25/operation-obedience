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
    <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
      <p className="font-medium">
        {done ? "✅" : "⬜"} {label}
      </p>
      {note && (
        <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-400">
          {note}
        </p>
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
      "id, date, trained, trained_note, prayed, prayed_note, scripture, scripture_note, profiles(name)"
    )
    .eq("id", id)
    .single();

  if (!checkin) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-sm text-neutral-500">
        {checkin.date} · {checkin.profiles?.name ?? "A brother"}
      </p>
      <h1 className="mt-1 text-2xl font-bold">Daily check-in</h1>

      <div className="mt-4 flex flex-col gap-3">
        <CheckinItem label="Trained" done={checkin.trained} note={checkin.trained_note} />
        <CheckinItem label="Prayed" done={checkin.prayed} note={checkin.prayed_note} />
        <CheckinItem
          label="Read Scripture"
          done={checkin.scripture}
          note={checkin.scripture_note}
        />
      </div>

      <Comments checkinId={checkin.id} path={`/checkins/${checkin.id}`} />
    </main>
  );
}
