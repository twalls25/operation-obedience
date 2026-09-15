"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPodcastEpisode(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/podcast");
  }

  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const spotify_url = (formData.get("spotify_url") as string) || null;
  const apple_podcasts_url = (formData.get("apple_podcasts_url") as string) || null;
  const youtube_url = (formData.get("youtube_url") as string) || null;

  const { error } = await supabase.from("podcast_episodes").insert({
    title,
    date,
    spotify_url,
    apple_podcasts_url,
    youtube_url,
    created_by: user.id,
  });

  if (error) {
    redirect(`/podcast/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/podcast");
  redirect("/podcast");
}
