"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { Icon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Criterion = { id: string; name: string; description: string | null; sort_order: number };

export default function EvaluationPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const router = useRouter();
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [observation, setObservation] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!isSupabaseConfigured) { setError("Supabase não está configurado."); setLoading(false); return; }
      const client = createClient();
      const { data: { user } } = await client.auth.getUser();
      const { data: team } = await client.from("teams").select("jam_id").eq("id", teamId).single();
      if (!user || !team) { setError("Não foi possível identificar a equipe ou a sessão."); setLoading(false); return; }
      const { data: criteriaData } = await client.from("evaluation_criteria").select("id,name,description,sort_order").eq("jam_id", team.jam_id).order("sort_order");
      const loadedCriteria = (criteriaData ?? []) as Criterion[];
      setCriteria(loadedCriteria);
      const { data: mentor } = await client.from("mentors").select("id").eq("user_id", user.id).limit(1).single();
      if (mentor) {
        const { data: evaluation } = await client.from("evaluations").select("id,final_observation,evaluation_scores(criterion_id,score)").eq("team_id", teamId).eq("mentor_id", mentor.id).maybeSingle();
        if (evaluation) {
          setObservation(evaluation.final_observation ?? "");
          const scoreMap = new Map((evaluation.evaluation_scores ?? []).map((score: { criterion_id: string; score: number }) => [score.criterion_id, score.score]));
          setScores(loadedCriteria.map((criterion) => scoreMap.get(criterion.id) ?? 0));
        } else setScores(loadedCriteria.map(() => 0));
      } else setScores(loadedCriteria.map(() => 0));
      setLoading(false);
    };
    void load();
  }, [teamId]);

  const average = useMemo(() => { const valid = scores.filter((score) => score > 0); return valid.length ? (valid.reduce((sum, score) => sum + score, 0) / valid.length).toFixed(1) : "—"; }, [scores]);

  async function saveEvaluation() {
    setError("");
    if (!criteria.length || scores.some((score) => score < 1 || score > 5)) { setError("Cadastre critérios e atribua uma nota de 1 a 5 para cada um."); return; }
    setSaving(true);
    const client = createClient();
    const { data: { user } } = await client.auth.getUser();
    const { data: mentor } = await client.from("mentors").select("id").eq("user_id", user?.id ?? "").limit(1).single();
    if (!mentor) { setError("Seu usuário ainda não está associado como mentor."); setSaving(false); return; }
    const { data: savedEvaluation, error: evaluationError } = await client.from("evaluations").upsert({ team_id: teamId, mentor_id: mentor.id, final_observation: observation.trim() || null }, { onConflict: "team_id,mentor_id" }).select("id").single();
    if (evaluationError || !savedEvaluation) { setError(`Não foi possível salvar a avaliação: ${evaluationError?.message ?? "erro desconhecido"}`); setSaving(false); return; }
    const { error: scoreError } = await client.from("evaluation_scores").upsert(criteria.map((criterion, index) => ({ evaluation_id: savedEvaluation.id, criterion_id: criterion.id, score: scores[index] })), { onConflict: "evaluation_id,criterion_id" });
    if (scoreError) { setError(`Não foi possível salvar as notas: ${scoreError.message}`); setSaving(false); return; }
    setSaved(true);
    router.push(`/equipes/${teamId}`);
  }

  return <AppFrame><header className="mb-7 flex items-center gap-3"><Link href={`/equipes/${teamId}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated"><Icon name="back" /></Link><div><p className="text-xs font-bold uppercase tracking-[.14em] text-moss">Direção de Arte</p><h1 className="text-2xl font-black">Sua avaliação</h1></div></header>{loading ? <div className="rounded-2xl bg-white p-6 text-center text-sm text-[#ada3bb]">Carregando critérios...</div> : error && !criteria.length ? <p className="rounded-xl bg-[#48232d] p-3 text-sm text-[#ff9ba0]">{error}</p> : <><section className="brand-gradient mb-6 flex items-center justify-between rounded-[22px] p-5 text-white"><div><p className="text-xs uppercase tracking-[.15em] opacity-80">Nota calculada</p><strong className="mt-1 block text-4xl font-black">{average}<span className="ml-1 text-base font-normal opacity-80">/ 5</span></strong></div><Icon name="star" size={30} stroke={1.4} /></section><div className="space-y-4">{criteria.map((criterion, index) => <section key={criterion.id} className="rounded-[22px] border border-border bg-surface p-4 shadow-card"><div className="mb-4"><h2 className="font-bold">{criterion.name}</h2><p className="mt-1 text-xs leading-5 text-[#ada3bb]">{criterion.description || "Descrição não cadastrada"}</p></div><div className="grid grid-cols-5 gap-2">{[1, 2, 3, 4, 5].map((score) => <button type="button" key={score} aria-label={`${score} de 5`} onClick={() => setScores((current) => current.map((value, i) => i === index ? score : value))} className={`flex h-11 items-center justify-center rounded-xl text-sm font-bold transition ${scores[index] === score ? "bg-coral text-white ring-2 ring-white/30" : "bg-surface-elevated text-[#ada3bb]"}`}>{score}</button>)}</div>{scores[index] > 0 && <p className="mt-3 text-xs font-bold text-moss">Critério preenchido</p>}</section>)}<textarea rows={4} value={observation} onChange={(event) => setObservation(event.target.value)} placeholder="Observação final (opcional)" className="w-full rounded-2xl border border-border bg-surface p-4 text-sm outline-none focus:border-coral" />{error && <p className="rounded-xl bg-[#48232d] p-3 text-sm text-[#ff9ba0]">{error}</p>}<button disabled={saving} onClick={() => void saveEvaluation()} className="min-h-14 w-full rounded-2xl bg-ink text-sm font-bold text-white disabled:opacity-60">{saving ? "Salvando..." : saved ? "Avaliação salva ✓" : "Salvar avaliação"}</button></div></>}</AppFrame>;
}
