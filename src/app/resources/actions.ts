"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createResource(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const type = formData.get("type") as string;
  const title = formData.get("title") as string;
  const author = (formData.get("author") as string) || null;
  const description = formData.get("description") as string;
  const link = (formData.get("link") as string) || null;
  const content = (formData.get("content") as string) || null;

  const { error } = await supabase.from("resources").insert({
    type,
    title,
    author,
    description,
    link,
    content,
    created_by: user.id,
  });

  if (error) {
    redirect(`/resources/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/resources");
  redirect("/resources");
}
