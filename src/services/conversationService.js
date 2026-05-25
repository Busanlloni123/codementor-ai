import { supabase } from "./supabase";

export async function getConversations() {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createConversation(title = "Nueva conversacion") {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("conversations")
    .insert([{ user_id: user.id, title }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateConversationTitle(id, title) {
  const { error } = await supabase
    .from("conversations")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function getMessages(conversationId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function saveMessage(messageData) {
  const { data, error } = await supabase
    .from("messages")
    .insert([messageData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteConversation(id) {
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", id);

  if (error) throw error;
}