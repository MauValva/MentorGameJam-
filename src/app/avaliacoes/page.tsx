"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { listTeams } from "@/lib/data/teams";
import { createClient } from "@/lib/supabase/client";

type Row = { id: string; name: string; game: string; average: string | null; status: string };

export default function EvaluationsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const client = createClient();
      const { data: { user } } = await client.auth.getUser();
      const { data: mentor } = await client.from("mentors").select("id").eq("user_id", user?.id ?? "").limit(1).single();
      const teams = await listTeams();
      if (!mentor) { setError("Seu usuário ainda não está associado como mentor."); setLoading(false); return; }
      const { data: evaluations } = await client.from("evaluations").select("id,team_id,evaluation_scores(score)").eq("mentor_id", mentor.id);
      const byTeam = new Map((evaluations ?? []).map((evaluation) => { const scores = (evaluation.evaluation_scores ?? []).map((item: { score: number }) => item.score); return [evaluation.team_id, scores.length ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1) : null]; }));
      const nextRows = teams.map((team) => ({ id: team.id, name: team.name, game: team.game_name, average: byTeam.get(team.id) ?? null, status: byTeam.has(team.id) ? "Avaliação salva" : "Ainda não avaliada" }));
      nextRows.sort((a, b) => {
        if (a.average && b.average) return Number(b.average) - Number(a.average) || a.name.localeCompare(b.name, "pt-BR");
        if (a.average) return -1;
        if (b.average) return 1;
        return a.name.localeCompare(b.name, "pt-BR");
      });
      setRows(nextRows);
      setLoading(false);
    };
    void load().catch(() => { setError("Não foi possível carregar as avaliações."); setLoading(false); });
  }, []);

  return <AppFrame active="evaluations" className="flex h-screen flex-col overflow-hidden"><header className="mb-8 shrink-0"><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-moss">Direção de Arte</p><h1 className="font-serif text-[32px] font-bold leading-none tracking-[-.04em]">Avaliações</h1><p className="mt-3 text-sm leading-6 text-[#a9bab0]">Suas avaliações por equipe.</p></header><div className="min-h-0 flex-1 overflow-y-auto pb-8">{error ? <p className="rounded-xl bg-[#f8e4df] p-3 text-sm text-[#ee9c8d]">{error}</p> : loading ? <div className="rounded-2xl bg-white p-6 text-center text-sm text-[#a9bab0]">Carregando avaliações...</div> : rows.length === 0 ? <div className="rounded-2xl bg-white p-6 text-center text-sm text-[#a9bab0]">Nenhuma equipe cadastrada.</div> : <div className="space-y-3">{rows.map((row) => <Link href={`/equipes/${row.id}/avaliacao`} key={row.id} className="flex items-center justify-between gap-4 rounded-[20px] border border-[#e1e6de] bg-white p-4 shadow-card"><div className="min-w-0 flex-1"><h3 className="truncate text-base font-bold text-[#9be0b9]">{row.name}</h3><p className="mt-1 text-xs text-[#a9bab0]">{row.game} · {row.status}</p></div><div className="shrink-0 text-right">{row.average ? <><strong className="font-serif text-2xl text-white">{row.average}</strong><p className="text-[10px] font-bold text-[#a9bab0]">/ 5</p></> : <span className="text-xs font-bold text-[#9be0b9]">Avaliar</span>}</div></Link>)}</div>}</div></AppFrame>;
}
