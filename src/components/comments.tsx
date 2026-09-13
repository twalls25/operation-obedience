import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { addComment, deleteComment } from "@/lib/comments/actions";
import { parentColumn, type CommentParent } from "@/lib/comments/types";

type Props = CommentParent & { path: string; error?: string };

export async function Comments(props: Props) {
  const { path, error, ...parent } = props;
  const { column, value } = parentColumn(parent);
  const supabase = await createClient();

  const [{ data: comments }, { data: { user } }] = await Promise.all([
    supabase
      .from("comments")
      .select("id, body, created_at, profiles(name)")
      .eq(column, value)
      .order("created_at", { ascending: true })
      .returns<
        {
          id: string;
          body: string;
          created_at: string;
          profiles: { name: string | null } | null;
        }[]
      >(),
    supabase.auth.getUser(),
  ]);

  let isAdmin = false;
  if (user) {
    const { data: viewerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = viewerProfile?.role === "admin";
  }

  return (
    <section className="mt-8 flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-offwhite">Comments</h2>

      <ul className="flex flex-col gap-3">
        {comments?.length ? (
          comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-md border border-panel bg-panel/40 p-3 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-ember">
                  {comment.profiles?.name ?? "A brother"}
                </p>
                {isAdmin && (
                  <form action={deleteComment.bind(null, comment.id, path)}>
                    <button
                      type="submit"
                      className="text-xs text-muted hover:text-red-400"
                    >
                      Delete
                    </button>
                  </form>
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-offwhite">{comment.body}</p>
            </li>
          ))
        ) : (
          <p className="text-sm text-muted">No comments yet.</p>
        )}
      </ul>

      {error && (
        <p className="rounded-md border border-red-900 bg-red-950/60 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {user ? (
        <form
          action={addComment.bind(null, parent, path)}
          className="flex flex-col gap-2"
        >
          <textarea
            name="body"
            required
            rows={3}
            placeholder="Add a comment..."
            className="rounded-md border border-panel bg-transparent px-3 py-2 text-sm text-offwhite placeholder:text-muted focus:border-ember focus:outline-none"
          />
          <button
            type="submit"
            className="self-start rounded-md bg-ember px-4 py-2 text-sm font-medium text-charcoal hover:bg-ember/90"
          >
            Post
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted">
          <Link href="/login" className="text-ember hover:underline">
            Log in
          </Link>{" "}
          to leave a comment.
        </p>
      )}
    </section>
  );
}
