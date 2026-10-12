"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TeamForm } from "@/components/team-form";
import { createClient } from "@/lib/supabase/client";
import { saveTeamBundle } from "@/lib/team-persistence";
import { emptyTeamForm } from "@/lib/team-defaults";
import type { DatabaseTheme } from "@/lib/types";
import type { TeamFormValues } from "@/lib/team-types";

export default function NewTeamPage() { const router = useRouter(); const [themes, setThemes] = useState<DatabaseTheme[]>([]); const [ready, setReady] = useState(false); const [error, setError] = useState(""); useEffect(() => { const load = async () => { const client = createClient(); const { data: mentor } = await client.from("mentors").select("jam_id").limit(1).single(); if (!mentor) { setError("Seu usuário ainda não está associado a uma Game Jam."); setReady(true); return; } const { data } = await client.from("themes").select("id,name,description").eq("jam_id", mentor.jam_id).order("name"); setThemes((data ?? []) as DatabaseTheme[]); setReady(true); }; void load(); }, []); if (!ready) return <div className="mx-auto max-w-[430px] p-6">Carregando...</div>; if (error) return <div className="mx-auto max-w-[430px] p-6 text-sm text-[#974b3c]">{error}</div>; const initial = emptyTeamForm(); return <TeamForm mode="create" themes={themes} initialValues={initial} backHref="/equipes" onSave={async (values: TeamFormValues) => { await saveTeamBundle(values); router.push("/equipes"); }} />; }
