"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { Icon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { DatabaseTheme } from "@/lib/types";

export default function ThemesPage() {
  const [themes, setThemes] = useState<DatabaseTheme[]>([]);
  const [editing, setEditing] = useState<DatabaseTheme | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) { setMessage("Supabase não está configurado."); setLoading(false); return; }
    const load = async () => {
      const { data, error } = await createClient().from("themes").select("id,name,description").order("name");
      if (!error && data) setThemes(data as DatabaseTheme[]);
      setLoading(false);
    };
    void load();
  }, []);

  function startEdit(theme: DatabaseTheme) {
    setEditing(theme); setName(theme.name); setDescription(theme.description ?? ""); setMessage("");
  }

  function resetForm() { setEditing(null); setName(""); setDescription(""); }

  async function saveTheme(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true); setMessage("");
    if (isSupabaseConfigured) {
      const client = createClient();
      if (editing) {
        const { data, error } = await client.from("themes").update({ name: name.trim(), description: description.trim() || null }).eq("id", editing.id).select("id,name,description").single();
        if (error || !data) { setMessage("Não foi possível atualizar o tema."); setSaving(false); return; }
        setThemes((current) => current.map((theme) => theme.id === editing.id ? data as DatabaseTheme : theme));
      } else {
        const { data: mentor } = await client.from("mentors").select("jam_id").limit(1).single();
        if (!mentor) { setMessage("Seu usuário ainda não está associado a uma Jam."); setSaving(false); return; }
        const { data, error } = await client.from("themes").insert({ jam_id: mentor.jam_id, name: name.trim(), description: description.trim() || null }).select("id,name,description").single();
        if (error || !data) { setMessage("Não foi possível criar o tema."); setSaving(false); return; }
        setThemes((current) => [...current, data as DatabaseTheme].sort((a, b) => a.name.localeCompare(b.name)));
      }
    }
    resetForm(); setSaving(false); setMessage("Tema salvo.");
  }

  async function deleteTheme(theme: DatabaseTheme) {
    if (!window.confirm(`Excluir o tema “${theme.name}”? Essa ação não pode ser desfeita.`)) return;
    if (isSupabaseConfigured) {
      const { error } = await createClient().from("themes").delete().eq("id", theme.id);
      if (error) { setMessage("Não é possível excluir um tema que está sendo usado por uma equipe."); return; }
    }
    setThemes((current) => current.filter((item) => item.id !== theme.id));
    if (editing?.id === theme.id) resetForm();
    setMessage("Tema excluído.");
  }

  return <AppFrame active="settings"><header className="mb-7 flex items-center gap-3"><Link href="/configuracoes" className="flex h-10 w-10 items-center justify-center rounded-full bg-white"><Icon name="back" /></Link><div><p className="text-xs font-bold uppercase tracking-[.14em] text-moss">Configurações</p><h1 className="font-serif text-2xl font-bold">Temas</h1></div></header><form onSubmit={saveTheme} className="mb-6 rounded-[22px] bg-white p-4 shadow-card"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold">{editing ? "Editar tema" : "Novo tema"}</h2>{editing && <button type="button" onClick={resetForm} className="text-xs font-bold text-moss">Cancelar</button>}</div><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome do tema" className="mb-2 h-12 w-full rounded-xl border border-[#dbe1d8] px-3 text-sm outline-none focus:border-moss" /><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descrição opcional" rows={2} className="mb-3 w-full rounded-xl border border-[#dbe1d8] p-3 text-sm outline-none focus:border-moss" /><button disabled={saving} className="min-h-12 w-full rounded-xl bg-ink text-sm font-bold text-white disabled:opacity-60">{saving ? "Salvando..." : editing ? "Salvar alterações" : "Adicionar tema"}</button>{message && <p className="mt-3 text-center text-xs font-bold text-moss">{message}</p>}</form><div className="mb-3 flex items-center justify-between"><h2 className="text-xs font-bold uppercase tracking-[.16em] text-[#71807b]">Temas cadastrados</h2><span className="text-xs text-[#9aa6a0]">{loading ? "..." : themes.length}</span></div><div className="space-y-3">{loading ? <div className="rounded-2xl bg-white p-6 text-center text-sm text-[#71807b]">Carregando temas...</div> : themes.map((theme) => <article key={theme.id} className="rounded-[20px] border border-[#e1e6de] bg-white p-4 shadow-card"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{theme.name}</h3><p className="mt-1 text-sm leading-5 text-[#71807b]">{theme.description || "Sem descrição"}</p></div><div className="flex gap-1"><button type="button" onClick={() => startEdit(theme)} aria-label={`Editar ${theme.name}`} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf2e9] text-moss"><Icon name="edit" size={16} /></button><button type="button" onClick={() => deleteTheme(theme)} aria-label={`Excluir ${theme.name}`} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f8e4df] text-[#974b3c]">×</button></div></div></article>)}</div></AppFrame>;
}
