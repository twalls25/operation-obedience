"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isActiveUser, RESTRICTED_MESSAGE } from "@/lib/moderation";
import { sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";
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

  if (!(await isActiveUser(supabase, user.id))) {
    redirect(`${path}?comment_error=${encodeURIComponent(RESTRICTED_MESSAGE)}`);
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
    redirect(
      `${path}?comment_error=${encodeURIComponent(
        "Something went wrong posting your comment. Please try again."
      )}`
    );
  }

  revalidatePath(path);
}

export async function deleteComment(commentId: string, path: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: viewerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (viewerProfile?.role !== "admin") {
    redirect(path);
  }

  const { data: comment } = await supabase
    .from("comments")
    .select("user_id")
    .eq("id", commentId)
    .single();

  const { error } = await supabase.from("comments").delete().eq("id", commentId);

  if (error) {
    console.error("DELETE COMMENT ERROR", error.message);
    redirect(
      `${path}?comment_error=${encodeURIComponent(
        "Could not delete that comment. Please try again."
      )}`
    );
  }

  if (comment?.user_id) {
    const { data: authorProfile } = await supabase
      .rpc("admin_get_profiles")
      .eq("id", comment.user_id)
      .maybeSingle<{ email: string | null }>();

    if (authorProfile?.email) {
      try {
        await sendEmail({
          to: authorProfile.email,
          subject: "A comment you posted was removed",
          text: `Hi,\n\nA comment you recently posted on Operation Obedience was removed for violating our community guidelines.\n\nYou can review our Community Guidelines here: ${SITE_URL}/guidelines\n\nIf you have questions, please reach out to an admin.\n\n— Operation Obedience`,
        });
      } catch (e) {
        // Deletion already succeeded above; the notification is
        // best-effort and shouldn't block or fail the admin's action.
        console.error("Failed to send comment-removal email", e);
      }
    }
  }

  revalidatePath(path);
}
