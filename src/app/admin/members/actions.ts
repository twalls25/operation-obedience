"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import type { SupabaseClient } from "@supabase/supabase-js";

async function requireAdmin(supabase: SupabaseClient) {
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
    redirect("/");
  }
}

export async function updateMemberStatus(memberId: string, formData: FormData) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const { data: target } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", memberId)
    .single();

  if (target?.role === "admin") {
    redirect(
      `/admin/members/${memberId}?error=${encodeURIComponent(
        "Admin status can only be changed by Tyler directly, not through this page."
      )}`
    );
  }

  const status = formData.get("status") as string;

  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", memberId);

  if (error) {
    redirect(
      `/admin/members/${memberId}?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/admin/members");
  redirect(`/admin/members/${memberId}?saved=1`);
}

export async function sendMemberEmail(memberId: string, formData: FormData) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  const { data: member } = await supabase
    .rpc("admin_get_profiles")
    .eq("id", memberId)
    .maybeSingle<{ email: string | null }>();

  if (!member?.email) {
    redirect(
      `/admin/members/${memberId}?error=${encodeURIComponent(
        "Could not find that member's email."
      )}`
    );
  }

  try {
    await sendEmail({ to: member.email, subject, text: message });
  } catch (e) {
    const reason = e instanceof Error ? e.message : "Unknown error";
    redirect(
      `/admin/members/${memberId}?error=${encodeURIComponent(
        `Failed to send email: ${reason}`
      )}`
    );
  }

  redirect(`/admin/members/${memberId}?emailed=1`);
}
