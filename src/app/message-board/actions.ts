"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createMessageBoardPost(formData: FormData) {
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
    redirect("/message-board");
  }

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const pinned = formData.get("pinned") === "on";

  const { error } = await supabase.from("message_board_posts").insert({
    title,
    body,
    pinned,
    created_by: user.id,
  });

  if (error) {
    redirect(`/message-board/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/message-board");
  redirect("/message-board");
}
