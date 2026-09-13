import type { SupabaseClient } from "@supabase/supabase-js";

// True if the user is allowed to post/comment (i.e. not restricted or
// banned). Banned users shouldn't reach this point at all — middleware
// signs them out — but the check is repeated here as defense in depth.
export async function isActiveUser(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", userId)
    .single();

  return (data?.status ?? "active") === "active";
}

export const RESTRICTED_MESSAGE =
  "Your account is currently restricted from posting or commenting.";
