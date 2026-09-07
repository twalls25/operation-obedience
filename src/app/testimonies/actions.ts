"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTestimony(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const verse_reference = formData.get("verse_reference") as string;
  const verse_text = formData.get("verse_text") as string;
  const context = formData.get("context") as string;
  const date = formData.get("date") as string;

  const { error } = await supabase.from("testimonies").insert({
    author_id: user.id,
    verse_reference,
    verse_text,
    context,
    date,
  });

  if (error) {
    redirect(`/testimonies/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/testimonies");
  redirect("/");
}
