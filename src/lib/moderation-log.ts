import type { SupabaseClient } from "@supabase/supabase-js";

type LogEntry = {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  note?: string;
};

// Best-effort: called after the moderation action itself succeeded, so a
// failed log write is reported loudly in the server logs but never undoes
// or blocks the action.
export async function logModerationAction(
  supabase: SupabaseClient,
  { actorId, action, targetType, targetId, note }: LogEntry
) {
  const { error } = await supabase.from("moderation_log").insert({
    actor_id: actorId,
    action,
    target_type: targetType,
    target_id: targetId ?? null,
    note: note ?? null,
  });

  if (error) {
    console.error("MODERATION LOG ERROR", action, error.message);
  }
}
