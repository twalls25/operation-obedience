import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  RESOURCE_TYPES,
  PUBLIC_RESOURCE_TYPES,
  RESOURCE_TYPE_LABELS,
  type ResourceType,
} from "@/lib/resources/types";

function FilterLink({
  active,
  href,
  children,
}: {
  active: boolean;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 text-sm ${
        active
          ? "border-ember bg-ember text-charcoal"
          : "border-panel text-muted hover:text-offwhite"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  // Logged-out visitors only get book/sermon/article — plan/video require
  // an account (see CLAUDE.md's "Public vs member visibility" note).
  const visibleTypes: readonly string[] = user ? RESOURCE_TYPES : PUBLIC_RESOURCE_TYPES;
  const effectiveType = type && visibleTypes.includes(type) ? type : undefined;

  let query = supabase
    .from("resources")
    .select("id, type, title, author, description, link, date")
    .in("type", visibleTypes)
    .order("date", { ascending: false });

  if (effectiveType) {
    query = query.eq("type", effectiveType);
  }

  const { data: resources } = await query;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-offwhite">Content Library</h1>
        {profile?.role === "admin" && (
          <Link
            href="/resources/new"
            className="rounded-md bg-ember px-4 py-2 text-sm font-medium text-charcoal hover:bg-ember/90"
          >
            Add resource
          </Link>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <FilterLink active={!effectiveType} href="/resources">
          All
        </FilterLink>
        {visibleTypes.map((t) => (
          <FilterLink key={t} active={effectiveType === t} href={`/resources?type=${t}`}>
            {RESOURCE_TYPE_LABELS[t as ResourceType]}
          </FilterLink>
        ))}
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {resources?.length ? (
          resources.map((resource) => (
            <li
              key={resource.id}
              className="rounded-md border border-panel bg-panel/40 p-4"
            >
              <p className="text-xs uppercase tracking-wide text-ember">
                {RESOURCE_TYPE_LABELS[resource.type as ResourceType]}
              </p>
              {resource.type === "plan" ? (
                <Link
                  href={`/resources/${resource.id}`}
                  className="font-medium text-offwhite hover:underline"
                >
                  {resource.title}
                </Link>
              ) : resource.link ? (
                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-offwhite hover:underline"
                >
                  {resource.title}
                </a>
              ) : (
                <p className="font-medium text-offwhite">{resource.title}</p>
              )}
              {resource.author && <p className="text-sm text-muted">{resource.author}</p>}
              <p className="mt-1 text-sm text-offwhite">{resource.description}</p>
            </li>
          ))
        ) : (
          <p className="text-sm text-muted">Nothing here yet.</p>
        )}
      </ul>

      {!user && (
        <p className="mt-8 text-sm text-muted">
          <Link href="/signup" className="text-ember hover:underline">
            Sign up
          </Link>{" "}
          for access to plans, videos, and the rest of the brotherhood.
        </p>
      )}
    </main>
  );
}
