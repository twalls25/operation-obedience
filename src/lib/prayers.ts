import type { SupabaseClient } from "@supabase/supabase-js";

export async function getActivePrayerCount(supabase: SupabaseClient) {
  const { count } = await supabase
    .from("prayer_requests")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}
