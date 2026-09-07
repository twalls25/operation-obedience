import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { addComment } from "@/lib/comments/actions";
import { parentColumn, type CommentParent } from "@/lib/comments/types";

type Props = CommentParent & { path: string };

export async function Comments(props: Props) {
  const { path, ...parent } = props;
  const { column, value } = parentColumn(parent);
  const supabase = await createClient();

  const [{ data: comments }, { data: { user } }] = await Promise.all([
    supabase
      .from("comments")
      .select("id, body, created_at, profiles(name)")
      .eq(column, value)
      .order("created_at", { ascending: true }),
    supabase.auth.getUser(),
  ]);

  return (
    <section className="mt-8 flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Comments</h2>

      <ul className="flex flex-col gap-3">
        {comments?.length ? (
          comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800"
            >
              <p className="font-medium">
                {comment.profiles?.name ?? "A brother"}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{comment.body}</p>
            </li>
          ))
        ) : (
          <p className="text-sm text-neutral-500">No comments yet.</p>
        )}
      </ul>

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
            className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
          <button
            type="submit"
            className="self-start rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Post
          </button>
        </form>
      ) : (
        <p className="text-sm text-neutral-500">
          <Link href="/login" className="underline">
            Log in
          </Link>{" "}
          to leave a comment.
        </p>
      )}
    </section>
  );
}
