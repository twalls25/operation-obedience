import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { submitCheckin } from "../actions";

export default async function NewCheckinPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data: existing } = await supabase
    .from("checkins")
    .select(
      "trained, trained_note, prayed, prayed_note, scripture, scripture_note, working_on"
    )
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold text-offwhite">Today&apos;s check-in</h1>
      <p className="mt-1 text-sm text-muted">{today}</p>

      {error && (
        <p className="mt-4 rounded-md border border-red-900 bg-red-950/60 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <form className="mt-6 flex flex-col gap-6">
        <fieldset className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-medium text-offwhite">
            <input
              type="checkbox"
              name="trained"
              defaultChecked={existing?.trained ?? false}
            />
            Trained
          </label>
          <textarea
            name="trained_note"
            rows={2}
            placeholder="Optional note"
            defaultValue={existing?.trained_note ?? ""}
            className="rounded-md border border-panel bg-transparent px-3 py-2 text-sm text-offwhite placeholder:text-muted focus:border-ember focus:outline-none"
          />
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-medium text-offwhite">
            <input
              type="checkbox"
              name="prayed"
              defaultChecked={existing?.prayed ?? false}
            />
            Prayed
          </label>
          <textarea
            name="prayed_note"
            rows={2}
            placeholder="Optional note"
            defaultValue={existing?.prayed_note ?? ""}
            className="rounded-md border border-panel bg-transparent px-3 py-2 text-sm text-offwhite placeholder:text-muted focus:border-ember focus:outline-none"
          />
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-medium text-offwhite">
            <input
              type="checkbox"
              name="scripture"
              defaultChecked={existing?.scripture ?? false}
            />
            Read Scripture
          </label>
          <textarea
            name="scripture_note"
            rows={2}
            placeholder="Optional note"
            defaultValue={existing?.scripture_note ?? ""}
            className="rounded-md border border-panel bg-transparent px-3 py-2 text-sm text-offwhite placeholder:text-muted focus:border-ember focus:outline-none"
          />
        </fieldset>

        <label className="flex flex-col gap-1 text-sm text-offwhite">
          What are you working through? (optional)
          <input
            name="working_on"
            type="text"
            placeholder="e.g. Foundations plan – Week 3"
            defaultValue={existing?.working_on ?? ""}
            className="rounded-md border border-panel bg-transparent px-3 py-2 text-offwhite placeholder:text-muted focus:border-ember focus:outline-none"
          />
        </label>

        <button
          formAction={submitCheckin}
          className="rounded-md bg-ember px-4 py-2 font-medium text-charcoal hover:bg-ember/90"
        >
          {existing ? "Update check-in" : "Submit check-in"}
        </button>
      </form>
    </main>
  );
}
