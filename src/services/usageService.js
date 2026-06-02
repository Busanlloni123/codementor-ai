import { supabase } from "./supabase";

const DAILY_LIMIT = 30;

export async function getDailyUsage() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("message_usage")
    .select("message_count")
    .eq("date", today)
    .single();

  if (error && error.code === "PGRST116") {
    return { count: 0, limit: DAILY_LIMIT, remaining: DAILY_LIMIT };
  }

  if (error) throw error;

  const count = data?.message_count || 0;
  return {
    count,
    limit: DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - count),
  };
}

export async function incrementUsage() {
  const { data: { user } } = await supabase.auth.getUser();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .rpc("increment_message_count", {
      p_user_id: user.id,
      p_date: today,
    });

  if (error) throw error;
  return data;
}

export async function canSendMessage() {
  const usage = await getDailyUsage();
  return usage.remaining > 0;
}