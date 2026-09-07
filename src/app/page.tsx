import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: testimony } = await supabase
    .from("testimonies")
    .select("id, verse_reference, verse_text, context, date, profiles(name)")
    .lte("date", today)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold">Today&apos;s Testimony</h1>

      {testimony ? (
        <div className="mt-6">
          <p className="text-sm text-neutral-500">
            {testimony.date} · {testimony.profiles?.name ?? "A brother"}
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            {testimony.verse_reference}
          </h2>
          <blockquote className="mt-4 border-l-2 border-neutral-300 pl-4 italic text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
            {testimony.verse_text}
          </blockquote>
          <p className="mt-4 whitespace-pre-wrap">{testimony.context}</p>

          <Link
            href={`/testimonies/${testimony.id}`}
            className="mt-4 inline-block underline"
          >
            View & discuss
          </Link>
        </div>
      ) : (
        <p className="mt-6 text-neutral-500">
          No testimony has been posted yet. Check back soon.
        </p>
      )}

      <p className="mt-8 text-sm">
        <Link href="/testimonies" className="underline">
          Browse the archive
        </Link>
      </p>
    </main>
  );
}
