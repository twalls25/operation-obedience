import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-bold text-offwhite">Your profile</h1>
      <p className="mt-1 text-sm text-muted">{user.email}</p>

      {error && (
        <p className="mt-4 rounded-md border border-red-900 bg-red-950/60 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      {saved && (
        <p className="mt-4 rounded-md border-l-2 border-ember bg-panel px-3 py-2 text-sm text-offwhite">
          Profile saved.
        </p>
      )}

      <form className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-offwhite">
          Name
          <input
            name="name"
            type="text"
            defaultValue={profile?.name ?? ""}
            className="rounded-md border border-panel bg-transparent px-3 py-2 text-offwhite focus:border-ember focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-offwhite">
          Avatar URL (optional)
          <input
            name="avatar_url"
            type="url"
            defaultValue={profile?.avatar_url ?? ""}
            className="rounded-md border border-panel bg-transparent px-3 py-2 text-offwhite focus:border-ember focus:outline-none"
          />
        </label>

        <button
          formAction={updateProfile}
          className="mt-2 rounded-md bg-ember px-4 py-2 font-medium text-charcoal hover:bg-ember/90"
        >
          Save
        </button>
      </form>
    </main>
  );
}
