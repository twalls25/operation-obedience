"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCharity(formData: FormData) {
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
    redirect("/charities");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const link = (formData.get("link") as string) || null;

  const { error } = await supabase
    .from("charities")
    .insert({ name, description, link, created_by: user.id });

  if (error) {
    redirect(`/charities/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/charities");
  redirect("/charities");
}
