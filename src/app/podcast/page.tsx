import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function PlatformLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full border border-panel px-3 py-1 text-sm text-muted hover:border-ember hover:text-offwhite"
    >
      {children}
    </a>
  );
}

export default async function PodcastPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  const { data: episodes } = await supabase
    .from("podcast_episodes")
    .select("id, title, date, spotify_url, apple_podcasts_url, youtube_url")
    .order("date", { ascending: false });

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-offwhite">Podcast</h1>
        {profile?.role === "admin" && (
          <Link
            href="/podcast/new"
            className="rounded-md bg-ember px-4 py-2 text-sm font-medium text-charcoal hover:bg-ember/90"
          >
            Add episode
          </Link>
        )}
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {episodes?.length ? (
          episodes.map((episode) => (
            <li
              key={episode.id}
              className="rounded-md border border-panel bg-panel/40 p-4"
            >
              <p className="font-medium text-offwhite">{episode.title}</p>
              <p className="text-sm text-muted">{episode.date}</p>

              {(episode.spotify_url || episode.apple_podcasts_url || episode.youtube_url) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {episode.spotify_url && (
                    <PlatformLink href={episode.spotify_url}>🎧 Spotify</PlatformLink>
                  )}
                  {episode.apple_podcasts_url && (
                    <PlatformLink href={episode.apple_podcasts_url}>
                      🍎 Apple Podcasts
                    </PlatformLink>
                  )}
                  {episode.youtube_url && (
                    <PlatformLink href={episode.youtube_url}>▶️ YouTube</PlatformLink>
                  )}
                </div>
              )}
            </li>
          ))
        ) : (
          <p className="text-sm text-muted">
            Coming soon! Our first episode is on the way.
          </p>
        )}
      </ul>
    </main>
  );
}
