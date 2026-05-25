import { supabase } from "./supabase";

export async function saveAnalysis(analysisData) {
  const { data, error } = await supabase
    .from("analyses")
    .insert([analysisData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserAnalyses() {
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAnalysisById(id) {
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAnalysis(id) {
  const { error } = await supabase
    .from("analyses")
    .delete()
    .eq("id", id);

  if (error) throw error;
}