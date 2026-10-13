"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/icons";

export type VisitHistoryItem = {
  id: string;
  status: string | null;
  notes: string;
  tags: string[] | null;
  needs_revisit: boolean;
  revisit_reason: string | null;
  visited_at: string;
};

function statusClass(status: string | null) {
  return status === "bem" ? "status-positive" : status === "atencao" ? "status-attention" : status === "problema" ? "status-problem" : "bg-surface-elevated text-white";
}

function statusLabel(status: string | null) {
  return status === "bem" ? "Bem" : status === "atencao" ? "Atenção" : status === "problema" ? "Problema" : "Sem status";
}

export function VisitHistory({ initialVisits }: { initialVisits: VisitHistoryItem[] }) {
  const [visits, setVisits] = useState(initialVisits);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function removeVisit(visit: VisitHistoryItem) {
    if (!window.confirm("Excluir esta anotação de mentoria? Essa ação não pode ser desfeita.")) return;
    setDeletingId(visit.id);
    setError("");
    const { data: deletedRows, error: deleteError } = await createClient().from("visits").delete().eq("id", visit.id).select("id");
    if (deleteError || !deletedRows?.some((row) => row.id === visit.id)) {
      setError("Não foi possível excluir esta anotação.");
      setDeletingId(null);
      return;
    }
    setVisits((current) => current.filter((item) => item.id !== visit.id));
    setDeletingId(null);
  }

  return <section><div className="mb-4 flex items-center justify-between"><h2 className="text-xs font-bold uppercase tracking-[.16em]">Histórico de mentorias</h2><span className="text-xs text-[#ada3bb]">{visits.length} registros</span></div>{error && <p className="mb-3 rounded-xl bg-[#48232d] p-3 text-xs font-bold text-[#ff9ba0]">{error}</p>}{visits.length === 0 ? <div className="rounded-2xl bg-white p-6 text-center text-sm text-[#ada3bb]">Nenhuma mentoria registrada.</div> : <div className="space-y-4">{visits.map((visit, index) => <article key={visit.id} className="rounded-2xl border border-border bg-surface p-4 shadow-card"><div className="mb-2 flex items-center justify-between gap-3 text-xs text-[#ada3bb]"><span>{new Date(visit.visited_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" })} · Visita #{visits.length - index}</span><div className="flex items-center gap-2"><strong className={`rounded-md px-2 py-1 ${statusClass(visit.status)}`}>{statusLabel(visit.status)}</strong><button type="button" aria-label="Excluir anotação" title="Excluir anotação" disabled={deletingId === visit.id} onClick={() => void removeVisit(visit)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#48232d] text-[#ff9ba0] transition hover:bg-[#60303b] disabled:cursor-wait disabled:opacity-50"><Icon name="trash" size={16} /></button></div></div><p className="text-sm leading-6 text-[#f9f7fb]">{visit.notes}</p>{visit.tags?.length ? <div className="mt-3 flex flex-wrap gap-2">{visit.tags.map((tag) => <span key={tag} className="rounded-full bg-purple px-2.5 py-1 text-xs font-bold text-white">{tag}</span>)}</div> : null}{visit.needs_revisit && <p className="mt-3 text-xs font-bold text-warning">Revisitar: {visit.revisit_reason}</p>}</article>)}</div>}</section>;
}
