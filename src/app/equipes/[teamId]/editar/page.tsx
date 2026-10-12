"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TeamForm } from "@/components/team-form";
import { createClient } from "@/lib/supabase/client";
import { saveTeamBundle } from "@/lib/team-persistence";
import type { TeamFormValues } from "@/lib/team-types";
import type { DatabaseTheme } from "@/lib/types";

export default function EditTeamPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const router = useRouter();
  const [themes, setThemes] = useState<DatabaseTheme[]>([]);
  const [initial, setInitial] = useState<TeamFormValues | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const client = createClient();
      const { data: team, error: teamError } = await client.from("teams").select("*").eq("id", teamId).single();
      if (teamError || !team) {
        setError("Equipe não encontrada.");
        return;
      }

      const [{ data: themeData }, { data: members }, { data: references }, { data: artists }] = await Promise.all([
        client.from("themes").select("id,name,description").eq("jam_id", team.jam_id).order("name"),
        client.from("team_members").select("id,name,role").eq("team_id", teamId).order("created_at"),
        client.from("team_visual_references").select("id,name,description,sort_order").eq("team_id", teamId).order("sort_order"),
        client.from("team_artists").select("team_member_id").eq("team_id", teamId),
      ]);

      const memberDrafts = (members ?? []).map((member) => ({ clientId: member.id, id: member.id, name: member.name, role: member.role }));
      const artistIds = new Set((artists ?? []).map((artist) => artist.team_member_id));
      setThemes((themeData ?? []) as DatabaseTheme[]);
      setInitial({
        name: team.name,
        gameName: team.game_name,
        themeId: team.theme_id,
        description: team.description ?? "",
        notes: team.general_notes ?? "",
        genre: team.genre ?? "",
        engine: team.engine ?? "",
        platform: team.platform ?? "",
        dimension: team.dimension ?? "",
        camera: team.camera ?? "",
        targetAudience: team.target_audience ?? "",
        mainMechanic: team.main_mechanic ?? "",
        gameDifferential: team.game_differential ?? "",
        currentState: team.current_state ?? "",
        visualStyles: team.visual_styles ?? [],
        visualStyleOther: team.visual_style_other ?? "",
        artisticIntent: team.artistic_intent ?? "",
        plannedPalette: team.planned_palette ?? "",
        artTools: team.art_tools ?? "",
        mainArtChallenge: team.main_art_challenge ?? "",
        members: memberDrafts,
        references: (references ?? []).map((reference) => ({ clientId: reference.id, id: reference.id, name: reference.name, description: reference.description })),
        artistMemberClientIds: memberDrafts.filter((member) => artistIds.has(member.id ?? "")).map((member) => member.clientId),
      });
    };

    void load();
  }, [teamId]);

  if (error) return <div className="mx-auto max-w-[430px] p-6 text-sm text-[#974b3c]">{error}</div>;
  if (!initial) return <div className="mx-auto max-w-[430px] p-6">Carregando equipe...</div>;

  return (
    <TeamForm
      mode="edit"
      themes={themes}
      initialValues={initial}
      backHref={`/equipes/${teamId}`}
      onSave={async (values) => {
        await saveTeamBundle(values, teamId);
        router.push(`/equipes/${teamId}`);
      }}
      onDelete={async () => {
        if (!window.confirm("Excluir esta equipe?")) return;
        const { error: deleteError } = await createClient().from("teams").delete().eq("id", teamId);
        if (deleteError) {
          window.alert("Não foi possível excluir a equipe. Tente novamente.");
          return;
        }
        router.push("/equipes");
      }}
    />
  );
}
