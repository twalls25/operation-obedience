import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPrayerRequest } from "../actions";

export default async function NewPrayerRequestPage({
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

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold text-offwhite">Submit a prayer request</h1>

      {error && (
        <p className="mt-4 rounded-md border border-red-900 bg-red-950/60 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <form className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-offwhite">
          Title
          <input
            name="title"
            type="text"
            required
            className="rounded-md border border-panel bg-transparent px-3 py-2 text-offwhite focus:border-ember focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-offwhite">
          Description
          <textarea
            name="description"
            required
            rows={5}
            className="rounded-md border border-panel bg-transparent px-3 py-2 text-offwhite focus:border-ember focus:outline-none"
          />
        </label>

        <button
          formAction={createPrayerRequest}
          className="mt-2 rounded-md bg-ember px-4 py-2 font-medium text-charcoal hover:bg-ember/90"
        >
          Submit
        </button>
      </form>
    </main>
  );
}
