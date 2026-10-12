"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { Icon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

const tags = ["Identidade", "Legibilidade", "UI", "Coerência", "VFX", "Animação"];
const statusOptions = [
  { value: "bem", label: "Bem", className: "bg-[#287a55] text-white" },
  { value: "atencao", label: "Atenção", className: "bg-[#a8751d] text-white" },
  { value: "problema", label: "Problema", className: "bg-[#a34646] text-white" },
];

export default function NewVisitPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const router = useRouter();
  const [status, setStatus] = useState("bem");
  const [revisit, setRevisit] = useState(false);
  const [notes, setNotes] = useState("");
  const [revisitReason, setRevisitReason] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveVisit() {
    setError("");
    if (!notes.trim()) { setError("Escreva uma anotação antes de salvar a visita."); return; }
    if (revisit && !revisitReason.trim()) { setError("Informe o motivo da revisita."); return; }
    setSaving(true);
    const client = createClient();
    const { data: { user } } = await client.auth.getUser();
    const { data: mentor } = await client.from("mentors").select("id").eq("user_id", user?.id ?? "").limit(1).single();
    if (!mentor) { setError("Seu usuário ainda não está associado como mentor."); setSaving(false); return; }
    const { error: insertError } = await client.from("visits").insert({ team_id: teamId, mentor_id: mentor.id, status, tags: selected, notes: notes.trim(), needs_revisit: revisit, revisit_reason: revisit ? revisitReason.trim() : null });
    if (insertError) { setError(`Não foi possível salvar a visita: ${insertError.message}`); setSaving(false); return; }
    router.push(`/equipes/${teamId}`);
  }

  return <AppFrame><header className="mb-7 flex items-center gap-3"><Link href={`/equipes/${teamId}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-white"><Icon name="back" /></Link><div><p className="text-xs font-bold uppercase tracking-[.14em] text-moss">Nova mentoria</p><h1 className="font-serif text-2xl font-bold">Registro de visita</h1></div></header><div className="space-y-6"><section><label className="mb-3 block text-sm font-bold">Como está a equipe?</label><div className="grid grid-cols-3 gap-2">{statusOptions.map((option) => <button type="button" key={option.value} onClick={() => setStatus(option.value)} className={`min-h-12 rounded-xl text-xs font-bold transition ${status === option.value ? option.className : "bg-white text-[#71807b]"}`}>{option.label}</button>)}</div></section><section><label className="mb-3 block text-sm font-bold">Tags da observação</label><div className="flex flex-wrap gap-2">{tags.map((tag) => <button type="button" key={tag} onClick={() => setSelected((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])} className={`rounded-full px-3 py-2 text-xs font-bold transition ${selected.includes(tag) ? "bg-[#287a55] text-white" : "bg-white text-[#71807b]"}`}>{tag}</button>)}</div></section><section><label htmlFor="notes" className="mb-3 block text-sm font-bold">Anotação *</label><textarea id="notes" rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Observação da visita" className="w-full rounded-2xl border border-[#dbe1d8] bg-white p-4 text-sm outline-none focus:border-moss" /></section><section><label className="flex min-h-14 items-center justify-between rounded-2xl bg-white px-4"><span className="text-sm font-bold">Preciso revisitar esta equipe</span><input type="checkbox" checked={revisit} onChange={(event) => setRevisit(event.target.checked)} className="h-5 w-5 accent-moss" /></label>{revisit && <input required value={revisitReason} onChange={(event) => setRevisitReason(event.target.value)} placeholder="Motivo da revisita" className="mt-2 h-12 w-full rounded-2xl border border-[#dbe1d8] bg-white px-4 text-sm outline-none" />}</section>{error && <p className="rounded-xl bg-[#f8e4df] p-3 text-sm text-[#974b3c]">{error}</p>}<button disabled={saving} onClick={() => void saveVisit()} className="min-h-14 w-full rounded-2xl bg-ink text-sm font-bold text-white disabled:opacity-60">{saving ? "Salvando..." : "Salvar registro"}</button></div></AppFrame>;
}
