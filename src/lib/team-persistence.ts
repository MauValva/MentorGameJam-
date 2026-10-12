import { createClient } from "@/lib/supabase/client";
import type { TeamFormValues } from "./team-types";

export async function saveTeamBundle(values: TeamFormValues, teamId?: string) {
  const client = createClient();
  const { data: mentor, error: mentorError } = await client.from("mentors").select("jam_id").limit(1).single();
  if (mentorError || !mentor) throw new Error("Seu usuário não está associado a uma Game Jam.");
  const { data, error } = await client.rpc("save_team_bundle", {
    p_team_id: teamId ?? null,
    p_jam_id: mentor.jam_id,
    p_name: values.name.trim(),
    p_game_name: values.gameName.trim(),
    p_theme_id: values.themeId,
    p_engine: values.engine.trim() || null,
    p_description: values.description.trim() || null,
    p_notes: values.notes.trim() || null,
    p_genre: values.genre.trim() || null,
    p_platform: values.platform.trim() || null,
    p_dimension: values.dimension.trim() || null,
    p_camera: values.camera.trim() || null,
    p_target_audience: values.targetAudience.trim() || null,
    p_main_mechanic: values.mainMechanic.trim() || null,
    p_game_differential: values.gameDifferential.trim() || null,
    p_current_state: values.currentState || null,
    p_visual_styles: values.visualStyles,
    p_visual_style_other: values.visualStyleOther.trim() || null,
    p_artistic_intent: values.artisticIntent.trim() || null,
    p_planned_palette: values.plannedPalette.trim() || null,
    p_art_tools: values.artTools.trim() || null,
    p_main_art_challenge: values.mainArtChallenge.trim() || null,
    p_members: values.members,
    p_references: values.references,
    p_artist_member_client_ids: values.artistMemberClientIds,
    p_relationships_loaded: true,
  });
  if (error) throw new Error(error.message);
  return data as { team_id: string };
}
