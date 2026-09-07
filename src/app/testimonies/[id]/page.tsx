import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Comments } from "@/components/comments";

export default async function TestimonyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: testimony } = await supabase
    .from("testimonies")
    .select("id, verse_reference, verse_text, context, date, profiles(name)")
    .eq("id", id)
    .single();

  if (!testimony) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-sm text-neutral-500">
        {testimony.date} · {testimony.profiles?.name ?? "A brother"}
      </p>
      <h1 className="mt-1 text-2xl font-bold">{testimony.verse_reference}</h1>
      <blockquote className="mt-4 border-l-2 border-neutral-300 pl-4 italic text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
        {testimony.verse_text}
      </blockquote>
      <p className="mt-4 whitespace-pre-wrap">{testimony.context}</p>

      <Comments testimonyId={testimony.id} path={`/testimonies/${testimony.id}`} />
    </main>
  );
}
