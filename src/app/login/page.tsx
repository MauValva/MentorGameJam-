"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    if (!isSupabaseConfigured) {
      router.push("/equipes");
      return;
    }
    const { error: signInError } = await createClient().auth.signInWithPassword({ email, password });
    if (signInError) setError("Email ou senha inválidos.");
    else router.push("/equipes");
    setLoading(false);
  }

  return <main className="grain flex min-h-screen items-center justify-center bg-paper px-5"><div className="w-full max-w-[390px] rounded-[28px] border border-border bg-surface p-6 shadow-card"><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-moss">Game Jam+ / 2026</p><h1 className="brand-gradient-text text-4xl font-black tracking-[-.05em]">Game Jam<br />Mentor.</h1><p className="mt-4 text-sm leading-6 text-[#ada3bb]">Registre uma boa conversa antes que ela vire só uma lembrança.</p><form onSubmit={handleSubmit} className="mt-8 space-y-4"><label className="block text-sm font-bold">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-13 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-coral" placeholder="voce@email.com" /></label><label className="block text-sm font-bold">Senha<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-13 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-coral" placeholder="••••••••" /></label>{error && <p className="rounded-xl bg-[#48232d] p-3 text-sm text-[#ff9ba0]">{error}</p>}<button disabled={loading} className="min-h-14 w-full rounded-2xl bg-ink text-sm font-bold text-white disabled:opacity-60">{loading ? "Entrando..." : "Entrar"}</button></form>{!isSupabaseConfigured && <p className="mt-4 text-center text-xs text-[#ada3bb]">Modo demonstração ativo</p>}</div></main>;
}
