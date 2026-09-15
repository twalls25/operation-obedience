import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Comments } from "@/components/comments";

export default async function MessageBoardPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ comment_error?: string }>;
}) {
  const { id } = await params;
  const { comment_error: commentError } = await searchParams;
  const supabase = await createClient();

  const [{ data: post }, { data: { user } }] = await Promise.all([
    supabase
      .from("message_board_posts")
      .select("id, title, body, pinned, date, profiles(name)")
      .eq("id", id)
      .single()
      .returns<{
        id: string;
        title: string;
        body: string;
        pinned: boolean;
        date: string;
        profiles: { name: string | null } | null;
      }>(),
    supabase.auth.getUser(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center gap-2">
        {post.pinned && (
          <span className="rounded-full border border-ember px-2 py-0.5 text-xs text-ember">
            Pinned
          </span>
        )}
        <p className="text-sm text-muted">
          {post.date} · {post.profiles?.name ?? "A brother"}
        </p>
      </div>
      <h1 className="mt-1 text-2xl font-bold text-offwhite">{post.title}</h1>
      <p className="mt-4 whitespace-pre-wrap text-offwhite">{post.body}</p>

      {user ? (
        <Comments
          messageBoardPostId={post.id}
          path={`/message-board/${post.id}`}
          error={commentError}
        />
      ) : (
        <p className="mt-8 text-sm text-muted">
          <Link href="/login" className="text-ember hover:underline">
            Log in
          </Link>{" "}
          to join the discussion.
        </p>
      )}
    </main>
  );
}
