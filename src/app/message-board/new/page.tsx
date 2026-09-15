import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createMessageBoardPost } from "../actions";

export default async function NewMessageBoardPostPage({
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
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/message-board");
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold text-offwhite">New message board post</h1>

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
          Body
          <textarea
            name="body"
            required
            rows={6}
            className="rounded-md border border-panel bg-transparent px-3 py-2 text-offwhite focus:border-ember focus:outline-none"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-offwhite">
          <input
            name="pinned"
            type="checkbox"
            className="h-4 w-4 rounded border-panel bg-transparent"
          />
          Pin this post to the top
        </label>

        <button
          formAction={createMessageBoardPost}
          className="mt-2 rounded-md bg-ember px-4 py-2 font-medium text-charcoal hover:bg-ember/90"
        >
          Post
        </button>
      </form>
    </main>
  );
}
