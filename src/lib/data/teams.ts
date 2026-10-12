import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { DatabaseTeam } from "@/lib/types";

export async function listTeams(): Promise<DatabaseTeam[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = createClient();
  const { data, error } = await supabase.from("teams").select("id,name,game_name,engine,current_state,description,general_notes,theme_id,themes(name),team_members(id),visits(id,needs_revisit,revisit_reason,visited_at)").order("name");
  if (error) throw error;
  return (data ?? []) as unknown as DatabaseTeam[];
}

export async function createTeam(input: { name: string; game_name: string; theme_id: string; engine?: string; description?: string }) {
  const supabase = createClient();
  const { data, error } = await supabase.from("teams").insert(input).select().single();
  if (error) throw error;
  return data;
}
