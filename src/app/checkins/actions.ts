"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function submitCheckin(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const today = new Date().toISOString().slice(0, 10);

  const trained = formData.get("trained") === "on";
  const prayed = formData.get("prayed") === "on";
  const scripture = formData.get("scripture") === "on";
  const trained_note = (formData.get("trained_note") as string) || null;
  const prayed_note = (formData.get("prayed_note") as string) || null;
  const scripture_note = (formData.get("scripture_note") as string) || null;
  const working_on = (formData.get("working_on") as string) || null;

  const { error } = await supabase.from("checkins").upsert(
    {
      user_id: user.id,
      date: today,
      trained,
      trained_note,
      prayed,
      prayed_note,
      scripture,
      scripture_note,
      working_on,
    },
    { onConflict: "user_id,date" }
  );

  if (error) {
    redirect(`/checkins/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/checkins");
  redirect("/checkins");
}
