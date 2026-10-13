import Link from "next/link";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { Icon } from "@/components/icons";
import { VisitHistory } from "@/components/visit-history";
import { createClient } from "@/lib/supabase/server";

type Visit = { id: string; status: string | null; notes: string; tags: string[] | null; needs_revisit: boolean; revisit_reason: string | null; visited_at: string };
type Member = { id: string; name: string; role: string };
type Reference = { id: string; name: string; description: string };
type TeamData = {
  id: string; name: string; game_name: string; engine: string | null; description: string | null; general_notes: string | null;
  genre: string | null; platform: string | null; dimension: string | null; camera: string | null; target_audience: string | null;
  main_mechanic: string | null; game_differential: string | null; current_state: string | null; visual_styles: string[] | null;
  visual_style_other: string | null; artistic_intent: string | null; planned_palette: string | null; art_tools: string | null;
  main_art_challenge: string | null; themes: { name: string } | { name: string }[] | null; team_members: Member[] | null;
  visits: Visit[] | null; team_visual_references: Reference[] | null; team_artists: { team_member_id: string }[] | null;
};

function Field({ label, value, className = "" }: { label: string; value: string | null | undefined; className?: string }) {
  if (!value) return null;
  return <div className={className}><dt className="text-[10px] font-bold uppercase tracking-[.14em] text-moss">{label}</dt><dd className="mt-1 break-words text-sm leading-5 text-[#f9f7fb]">{value}</dd></div>;
}

function Section({ title, count, children, className = "" }: { title: string; count?: number; children: React.ReactNode; className?: string }) {
  return <section className={`surface-card rounded-[22px] p-4 shadow-card ${className}`}><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-base font-black">{title}</h2>{count !== undefined && <span className="rounded-full bg-surface-elevated px-2.5 py-1 text-xs font-bold text-[#ada3bb]">{count}</span>}</div>{children}</section>;
}

export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const client = await createClient();
  const { data } = await client.from("teams").select("*,themes(name),team_members(id,name,role),visits(id,status,notes,tags,needs_revisit,revisit_reason,visited_at),team_visual_references(id,name,description),team_artists(team_member_id)").eq("id", teamId).single();
  const team = data as unknown as TeamData | null;
  if (!team) notFound();

  const visits = [...(team.visits ?? [])].sort((a, b) => new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime());
  const theme = Array.isArray(team.themes) ? team.themes[0]?.name : team.themes?.name;
  const artistIds = new Set((team.team_artists ?? []).map((artist) => artist.team_member_id));
  const artists = (team.team_members ?? []).filter((member) => artistIds.has(member.id));
  const members = team.team_members ?? [];

  return <AppFrame active="teams">
    <div className="sticky top-0 z-10 -mx-5 bg-paper px-5 pb-4 pt-1">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/equipes" className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-[#f9f7fb]" aria-label="Voltar para equipes"><Icon name="back" /></Link>
        <Link href={`/equipes/${team.id}/editar`} className="flex items-center gap-2 text-sm font-bold text-moss"><Icon name="edit" size={17} />Editar</Link>
      </header>
      <section className="mb-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-moss">{theme || "Tema não cadastrado"}</p>
        <h1 className="text-[32px] font-black leading-none tracking-[-.045em]">{team.name}</h1>
        <p className="mt-2 text-base text-[#ada3bb]">{team.game_name}{team.engine ? ` · ${team.engine}` : ""}</p>
      </section>
      <div className="grid grid-cols-2 gap-3">
        <Link href={`/equipes/${team.id}/visitas/nova`} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-ink px-3 text-center text-sm font-bold text-white"><Icon name="plus" size={19} />Novo registro</Link>
        <Link href={`/equipes/${team.id}/avaliacao`} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-sun px-3 text-center text-sm font-bold text-ink"><Icon name="star" size={19} />Avaliar</Link>
      </div>
    </div>

    <div className="space-y-4 pb-8">
      <Section title="Identificação">
        <dl className="grid gap-4"><Field label="Descrição do jogo" value={team.description} /><Field label="Observações gerais" value={team.general_notes} /></dl>
      </Section>

      <Section title="Integrantes" count={members.length}>
        {members.length ? <div className="space-y-2">{members.map((member) => <div key={member.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl brand-gradient text-sm font-black text-white">{member.name.trim().charAt(0).toUpperCase() || "?"}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#f9f7fb]">{member.name}</p><p className="mt-1 truncate text-xs text-[#ada3bb]">{member.role || "Função não informada"}</p></div>
          {artistIds.has(member.id) && <span className="shrink-0 rounded-full bg-purple px-2.5 py-1 text-[10px] font-bold text-white">Arte</span>}
        </div>)}</div> : <p className="text-sm text-[#ada3bb]">Nenhum integrante cadastrado.</p>}
      </Section>

      <Section title="Informações do jogo">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
          <Field label="Gênero" value={team.genre} /><Field label="Plataforma" value={team.platform} /><Field label="Dimensão" value={team.dimension} /><Field label="Câmera" value={team.camera} /><Field label="Público-alvo" value={team.target_audience} /><Field label="Estado atual" value={team.current_state} />
          <Field label="Engine" value={team.engine} className="col-span-2" /><Field label="Mecânica principal" value={team.main_mechanic} className="col-span-2" /><Field label="Diferencial do jogo" value={team.game_differential} className="col-span-2" />
        </dl>
      </Section>

      <Section title="Direção de Arte">
        <div className="space-y-5">
          <div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-moss">Estilos visuais</p><div className="mt-2 flex flex-wrap gap-2">{(team.visual_styles ?? []).map((style) => <span key={style} className="rounded-full bg-purple px-3 py-1.5 text-xs font-bold text-white">{style}</span>)}{team.visual_style_other && <span className="rounded-full bg-purple px-3 py-1.5 text-xs font-bold text-white">{team.visual_style_other}</span>}</div></div>
          <Field label="Intenção artística" value={team.artistic_intent} />
          <div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-moss">Referências visuais</p>{team.team_visual_references?.length ? <div className="mt-2 space-y-2">{team.team_visual_references.map((reference) => <div key={reference.id} className="rounded-2xl border border-border bg-surface-elevated p-3"><p className="text-sm font-bold text-[#f9f7fb]">{reference.name}</p><p className="mt-1 text-xs leading-5 text-[#d4cadc]">{reference.description}</p></div>)}</div> : <p className="mt-2 text-sm text-[#ada3bb]">Nenhuma referência cadastrada.</p>}</div>
          <dl className="grid gap-4"><Field label="Paleta planejada" value={team.planned_palette} /><Field label="Ferramentas artísticas" value={team.art_tools} /><Field label="Principal desafio artístico" value={team.main_art_challenge} /></dl>
          <div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-moss">Responsáveis pela arte</p>{artists.length ? <div className="mt-2 flex flex-wrap gap-2">{artists.map((artist) => <span key={artist.id} className="rounded-full bg-purple px-3 py-1.5 text-xs font-bold text-white">{artist.name}</span>)}</div> : <p className="mt-1 text-sm text-[#ada3bb]">Nenhum responsável cadastrado.</p>}</div>
        </div>
      </Section>

      <VisitHistory initialVisits={visits} />
    </div>
  </AppFrame>;
}
