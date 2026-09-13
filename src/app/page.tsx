import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActivePrayerCount } from "@/lib/prayers";

export default async function Home() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: testimony } = await supabase
    .from("testimonies")
    .select("id, verse_reference, verse_text, context, date, profiles(name)")
    .lte("date", today)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle()
    .returns<{
      id: string;
      verse_reference: string;
      verse_text: string;
      context: string;
      date: string;
      profiles: { name: string | null } | null;
    }>();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold text-offwhite">Today&apos;s Testimony</h1>

      {testimony ? (
        <div className="mt-6">
          <p className="text-sm text-muted">
            {testimony.date} · {testimony.profiles?.name ?? "A brother"}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-offwhite">
            {testimony.verse_reference}
          </h2>
          <blockquote className="mt-4 border-l-2 border-ember pl-4 italic text-muted">
            {testimony.verse_text}
          </blockquote>
          <p className="mt-4 whitespace-pre-wrap text-offwhite">{testimony.context}</p>

          {user ? (
            <Link
              href={`/testimonies/${testimony.id}`}
              className="mt-4 inline-block text-ember hover:underline"
            >
              View & discuss
            </Link>
          ) : (
            <p className="mt-4 text-sm text-muted">
              <Link href="/login" className="text-ember hover:underline">
                Log in
              </Link>{" "}
              to join the discussion.
            </p>
          )}
        </div>
      ) : (
        <p className="mt-6 text-muted">
          No testimony has been posted yet. Check back soon.
        </p>
      )}

      {user ? (
        <p className="mt-8 text-sm">
          <Link href="/testimonies" className="text-ember hover:underline">
            Browse the archive
          </Link>
        </p>
      ) : (
        <PrayerTeaser supabase={supabase} />
      )}
    </main>
  );
}

async function PrayerTeaser({
  supabase,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
}) {
  const count = await getActivePrayerCount(supabase);

  return (
    <div className="mt-8 rounded-md border border-panel bg-panel/40 p-4">
      <p className="text-offwhite">
        {count} active prayer request{count === 1 ? "" : "s"} from our
        brotherhood.
      </p>
      <p className="mt-2 text-sm text-muted">
        <Link href="/signup" className="text-ember hover:underline">
          Join us
        </Link>{" "}
        to view the board and pray with your brothers.
      </p>
    </div>
  );
}
