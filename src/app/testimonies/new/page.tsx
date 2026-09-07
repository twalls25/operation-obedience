import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createTestimony } from "../actions";

export default async function NewTestimonyPage({
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold">Post a testimony</h1>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Verse reference
          <input
            name="verse_reference"
            type="text"
            required
            placeholder="Romans 8:28"
            className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Verse text
          <textarea
            name="verse_text"
            required
            rows={3}
            className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Context / reflection
          <textarea
            name="context"
            required
            rows={5}
            className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Date
          <input
            name="date"
            type="date"
            required
            defaultValue={today}
            className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
          />
        </label>

        <button
          formAction={createTestimony}
          className="mt-2 rounded-md bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Post
        </button>
      </form>
    </main>
  );
}
