"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPrayerRequest(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  const { error } = await supabase
    .from("prayer_requests")
    .insert({ user_id: user.id, title, description });

  if (error) {
    redirect(`/prayers/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/prayers");
  redirect("/prayers");
}

export async function toggleReaction(prayerRequestId: string, path: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: existing } = await supabase
    .from("prayer_reactions")
    .select("user_id")
    .eq("prayer_request_id", prayerRequestId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("prayer_reactions")
      .delete()
      .eq("prayer_request_id", prayerRequestId)
      .eq("user_id", user.id);
  } else {
    await supabase
      .from("prayer_reactions")
      .insert({ prayer_request_id: prayerRequestId, user_id: user.id });
  }

  revalidatePath(path);
}
