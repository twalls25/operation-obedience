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
    .select("trained, trained_note, prayed, prayed_note, scripture, scripture_note")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold">Today&apos;s check-in</h1>
      <p className="mt-1 text-sm text-neutral-500">{today}</p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form className="mt-6 flex flex-col gap-6">
        <fieldset className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-medium">
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
            className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-medium">
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
            className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-medium">
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
            className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
        </fieldset>

        <button
          formAction={submitCheckin}
          className="rounded-md bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {existing ? "Update check-in" : "Submit check-in"}
        </button>
      </form>
    </main>
  );
}
