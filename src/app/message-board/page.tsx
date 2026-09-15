import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type PostRow = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  date: string;
  profiles: { name: string | null } | null;
  comments: { count: number }[];
};

export default async function MessageBoardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  const { data: posts } = await supabase
    .from("message_board_posts")
    .select("id, title, body, pinned, date, profiles(name), comments(count)")
    .order("pinned", { ascending: false })
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<PostRow[]>();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-offwhite">Message Board</h1>
        {profile?.role === "admin" && (
          <Link
            href="/message-board/new"
            className="rounded-md bg-ember px-4 py-2 text-sm font-medium text-charcoal hover:bg-ember/90"
          >
            New post
          </Link>
        )}
      </div>
      <p className="mt-1 text-sm text-muted">
        Updates, events, and news from Operation Obedience.
      </p>

      <ul className="mt-6 flex flex-col gap-3">
        {posts?.length ? (
          posts.map((post) => {
            const commentCount = post.comments?.[0]?.count ?? 0;

            return (
              <li key={post.id}>
                <Link
                  href={`/message-board/${post.id}`}
                  className="block rounded-md border border-panel bg-panel/40 p-4 hover:bg-panel/70"
                >
                  <div className="flex items-center gap-2">
                    {post.pinned && (
                      <span className="rounded-full border border-ember px-2 py-0.5 text-xs text-ember">
                        Pinned
                      </span>
                    )}
                    <p className="font-medium text-offwhite">{post.title}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {post.date} · {post.profiles?.name ?? "A brother"}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-offwhite">{post.body}</p>
                  {user && (
                    <p className="mt-2 text-xs text-muted">
                      {commentCount} comment{commentCount === 1 ? "" : "s"}
                    </p>
                  )}
                </Link>
              </li>
            );
          })
        ) : (
          <p className="text-sm text-muted">No posts yet.</p>
        )}
      </ul>
    </main>
  );
}
