"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parentColumn, type CommentParent } from "./types";

export async function addComment(
  parent: CommentParent,
  path: string,
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const body = (formData.get("body") as string)?.trim();
  if (!body) {
    return;
  }

  const { column, value } = parentColumn(parent);

  const { error } = await supabase
    .from("comments")
    .insert({ user_id: user.id, body, [column]: value });

  if (error) {
    console.error("ADD COMMENT ERROR", error.message);
    return;
  }

  revalidatePath(path);
}
