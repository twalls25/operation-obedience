import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CharitiesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  const { data: charities } = await supabase
    .from("charities")
    .select("id, name, description, link")
    .order("date", { ascending: false });

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-offwhite">Charities & Nonprofits</h1>
        {profile?.role === "admin" && (
          <Link
            href="/charities/new"
            className="rounded-md bg-ember px-4 py-2 text-sm font-medium text-charcoal hover:bg-ember/90"
          >
            Add charity
          </Link>
        )}
      </div>
      <p className="mt-1 text-sm text-muted">
        Organizations we partner with and support.
      </p>

      <ul className="mt-6 flex flex-col gap-3">
        {charities?.length ? (
          charities.map((charity) => (
            <li
              key={charity.id}
              className="rounded-md border border-panel bg-panel/40 p-4"
            >
              {charity.link ? (
                <a
                  href={charity.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-offwhite hover:underline"
                >
                  {charity.name}
                </a>
              ) : (
                <p className="font-medium text-offwhite">{charity.name}</p>
              )}
              <p className="mt-1 text-sm text-offwhite">{charity.description}</p>
            </li>
          ))
        ) : (
          <p className="text-sm text-muted">
            We&apos;re putting together the list of organizations we partner
            with and support. Check back soon.
          </p>
        )}
      </ul>
    </main>
  );
}
