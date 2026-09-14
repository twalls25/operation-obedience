import { createClient } from "@/lib/supabase/server";
import { NavClient } from "./nav-client";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  return (
    <NavClient
      userEmail={user?.email ?? null}
      isAdmin={profile?.role === "admin"}
    />
  );
}
