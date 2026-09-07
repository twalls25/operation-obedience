import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RESOURCE_TYPE_LABELS, type ResourceType } from "@/lib/resources/types";

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: resource } = await supabase
    .from("resources")
    .select("id, type, title, author, description, content, link, date")
    .eq("id", id)
    .single();

  if (!resource) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-xs uppercase tracking-wide text-ember">
        {RESOURCE_TYPE_LABELS[resource.type as ResourceType]}
      </p>
      <h1 className="mt-1 text-2xl font-bold text-offwhite">{resource.title}</h1>
      {resource.author && <p className="text-sm text-muted">{resource.author}</p>}
      <p className="mt-4 text-offwhite">{resource.description}</p>

      {resource.content && (
        <div className="mt-6 whitespace-pre-wrap text-offwhite">{resource.content}</div>
      )}

      {resource.link && (
        <a
          href={resource.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block text-ember hover:underline"
        >
          View resource
        </a>
      )}
    </main>
  );
}
