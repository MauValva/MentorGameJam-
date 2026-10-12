"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { Icon } from "@/components/icons";
import { listTeams } from "@/lib/data/teams";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import type { Team } from "@/lib/types";

type Filter = "Todas" | "Não visitadas" | "Revisitar";

export default function TeamsPage() {
  const [teamList, setTeamList] = useState<Team[]>([]);
  const [jamName, setJamName] = useState("");
  const [jamRegion, setJamRegion] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("Todas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) { setError("Supabase não está configurado."); setLoading(false); return; }
    const load = async () => {
      const client = createClient();
      const { data: mentor, error: mentorError } = await client.from("mentors").select("jam_id").limit(1).single();
      if (mentorError || !mentor) { setError("Seu usuário ainda não está associado a uma Game Jam."); setLoading(false); return; }
      const [{ data: jam }, teamsResult] = await Promise.all([client.from("jams").select("name,region").eq("id", mentor.jam_id).single(), listTeams()]);
      if (jam) { setJamName(jam.name); setJamRegion(jam.region); }
      setTeamList(teamsResult.map((team) => {
        const visits = team.visits ?? [];
        const latestVisit = [...visits].sort((a, b) => new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime())[0];
        const revisit = latestVisit?.needs_revisit ? latestVisit : undefined;
        return { id: team.id, name: team.name, game: team.game_name, theme: team.themes?.name ?? "Sem tema", engine: team.engine ?? "", currentState: team.current_state ?? undefined, members: team.team_members?.length ?? 0, visits: visits.length, revisit: revisit?.revisit_reason ?? (revisit ? "Acompanhamento solicitado" : undefined), accent: "" };
      }));
      setLoading(false);
    };
    void load().catch(() => { setError("Não foi possível carregar as equipes."); setLoading(false); });
  }, []);

  const filtered = useMemo(() => teamList.filter((team) => { const matchesQuery = `${team.name} ${team.game} ${team.theme}`.toLowerCase().includes(query.toLowerCase()); const matchesFilter = filter === "Todas" || (filter === "Não visitadas" ? team.visits === 0 : Boolean(team.revisit)); return matchesQuery && matchesFilter; }), [query, filter, teamList]);
  const visited = teamList.filter((team) => team.visits > 0).length;

  return <AppFrame active="teams" className="flex h-screen flex-col overflow-hidden"><header className="mb-7 shrink-0 flex items-start justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-moss">{jamName || "Game Jam"}</p><h1 className="font-serif text-[32px] font-bold leading-none tracking-[-.04em]">Equipes</h1></div></header>{error ? <div className="mb-6 shrink-0 rounded-2xl bg-[#f8e4df] p-4 text-sm text-[#974b3c]">{error}</div> : <section className="mb-6 shrink-0 rounded-[24px] bg-moss p-5 text-[#f4f5ed] shadow-card"><p className="text-sm opacity-75">{jamRegion || "Região não cadastrada"}</p><div className="mt-3 flex items-end justify-between"><div><strong className="text-3xl tracking-[-.04em]">{teamList.length}</strong><span className="ml-2 text-sm opacity-80">equipes</span></div><p className="text-right text-xs leading-5 opacity-80">{visited} visitadas<br />{teamList.length - visited} faltando</p></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-sun" style={{ width: teamList.length ? `${Math.round((visited / teamList.length) * 100)}%` : "0%" }} /></div></section>}{!error && <><div className="shrink-0"><div className="relative mb-4"><span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#81908b]"><Icon name="search" size={19} /></span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar equipe..." aria-label="Buscar equipe" className="h-12 w-full rounded-2xl border border-[#dbe1d8] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20" /></div><div className="mb-6 flex gap-2 overflow-auto pb-1">{(["Todas", "Não visitadas", "Revisitar"] as Filter[]).map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${filter === item ? "bg-[#285d46] text-[#dce8df]" : "bg-white text-[#71807b]"}`}>{item}</button>)}</div></div><div className="mb-3 flex shrink-0 items-center justify-between"><h2 className="text-sm font-bold uppercase tracking-[.13em] text-[#71807b]">{filtered.length} resultados</h2><Link href="/equipes/nova" className="flex items-center gap-1 text-sm font-bold text-moss"><Icon name="plus" size={16} />Nova equipe</Link></div><div className="min-h-0 flex-1 overflow-y-auto pb-8"><div className="space-y-3">{loading ? <div className="rounded-2xl bg-white p-8 text-center text-sm text-[#71807b]">Carregando equipes...</div> : filtered.length === 0 ? <div className="rounded-2xl bg-white p-8 text-center text-sm text-[#71807b]">Nenhuma equipe encontrada para este filtro.</div> : filtered.map((team) => <Link href={`/equipes/${team.id}`} key={team.id} className="group block rounded-[22px] border border-[#e1e6de] bg-white p-4 shadow-card transition active:scale-[.99]"><div className="flex items-center justify-between gap-4"><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><h3 className="truncate font-bold uppercase tracking-[.04em]">{team.name}</h3><p className="mt-0.5 text-sm text-[#60716b]">{team.game}</p></div><Icon name="arrow" size={18} /></div><div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#71807b]"><span className="rounded-full bg-[#285d46] px-2.5 py-1 font-bold text-[#dce8df]">{team.theme}</span><span>{team.visits} {team.visits === 1 ? "visita" : "visitas"}</span></div>{team.revisit && <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#a56e27]"><Icon name="alert" size={15} />Revisitar: {team.revisit}</div>}</div>{team.currentState && <span className="shrink-0 rounded-full bg-[#a8751d] px-2.5 py-1 text-center text-[10px] font-bold text-white">{team.currentState}</span>}</div></Link>)}</div></div></>}</AppFrame>;
}
