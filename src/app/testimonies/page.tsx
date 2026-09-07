import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function TestimoniesArchivePage() {
  const supabase = await createClient();

  const { data: testimonies } = await supabase
    .from("testimonies")
    .select("id, verse_reference, date, profiles(name)")
    .order("date", { ascending: false });

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold text-offwhite">Testimony archive</h1>

      <ul className="mt-6 flex flex-col gap-3">
        {testimonies?.length ? (
          testimonies.map((testimony) => (
            <li key={testimony.id}>
              <Link
                href={`/testimonies/${testimony.id}`}
                className="block rounded-md border border-panel bg-panel/40 p-3 hover:bg-panel/70"
              >
                <p className="font-medium text-offwhite">{testimony.verse_reference}</p>
                <p className="text-sm text-muted">
                  {testimony.date} · {testimony.profiles?.name ?? "A brother"}
                </p>
              </Link>
            </li>
          ))
        ) : (
          <p className="text-sm text-muted">No testimonies posted yet.</p>
        )}
      </ul>
    </main>
  );
}
