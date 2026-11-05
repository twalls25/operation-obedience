import type { SupabaseClient } from "@supabase/supabase-js";

// Goes through a security-definer function (022_lock_down_members_content)
// because logged-out visitors can no longer read prayer_requests directly.
export async function getActivePrayerCount(supabase: SupabaseClient) {
  const { data } = await supabase.rpc("prayer_request_count");
  return Number(data ?? 0);
}
