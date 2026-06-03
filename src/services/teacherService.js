import { supabase } from "./supabase";

// Comprueba si el usuario actual es profesor
export async function isTeacher() {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .single();

  if (error) return false;
  return data?.role === "teacher";
}

// Obtiene todos los estudiantes registrados
export async function getStudents() {
  const { data, error } = await supabase
    .from("user_roles")
    .select(`
      user_id,
      role,
      created_at
    `)
    .eq("role", "student");

  if (error) throw error;
  return data;
}

// Obtiene las conversaciones de un estudiante concreto
export async function getStudentConversations(userId) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Obtiene los mensajes de una conversación
export async function getStudentMessages(conversationId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

// Obtiene el uso diario de un estudiante
export async function getStudentUsage(userId) {
  const { data, error } = await supabase
    .from("message_usage")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(7);

  if (error) throw error;
  return data;
}