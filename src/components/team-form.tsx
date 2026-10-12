"use client";
import { FormEvent, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { Icon } from "@/components/icons";
import { gameStates, visualStyles } from "@/constants/team-options";
import type { DatabaseTheme } from "@/lib/types";
import type {
  TeamFormValues,
  TeamMemberDraft,
  TeamReferenceDraft,
} from "@/lib/team-types";

type Props = {
  mode: "create" | "edit";
  themes: DatabaseTheme[];
  initialValues: TeamFormValues;
  onSave: (values: TeamFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
  backHref: string;
};
const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `tmp-${Date.now()}-${Math.random()}`;
const textFields = [
  {
    key: "genre",
    label: "Gênero",
    placeholder: "Ex.: Plataforma, Puzzle, Aventura",
  },
  { key: "engine", label: "Engine", placeholder: "Ex.: Unity, Godot, Unreal" },
  { key: "platform", label: "Plataforma", placeholder: "Ex.: PC, Web, Mobile" },
  { key: "dimension", label: "Dimensão", placeholder: "Ex.: 2D, 2.5D, 3D" },
  { key: "camera", label: "Câmera", placeholder: "Ex.: Top-down, Isométrica" },
  {
    key: "targetAudience",
    label: "Público-alvo",
    placeholder: "Público do jogo",
  },
] as const;
function Input({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-bold">
      {label}
      {required ? " *" : ""}
      <input
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-xl border border-[#dbe1d8] bg-white px-3 text-sm outline-none focus:border-moss"
      />
    </label>
  );
}
function Area({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-bold">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="mt-2 w-full rounded-xl border border-[#dbe1d8] bg-white p-3 text-sm outline-none focus:border-moss"
      />
    </label>
  );
}

export function TeamForm({
  mode,
  themes,
  initialValues,
  onSave,
  onDelete,
  backHref,
}: Props) {
  const [values, setValues] = useState<TeamFormValues>(initialValues);
  const [open, setOpen] = useState("identification");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof TeamFormValues>(
    key: K,
    value: TeamFormValues[K],
  ) => setValues((current) => ({ ...current, [key]: value }));
  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!values.name.trim() || !values.gameName.trim() || !values.themeId) {
      setError("Preencha nome da equipe, nome do jogo e tema.");
      setOpen("identification");
      return;
    }
    setSaving(true);
    void onSave(values)
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Não foi possível salvar a equipe.",
        ),
      )
      .finally(() => setSaving(false));
  }
  function addMember() {
    set("members", [
      ...values.members,
      { clientId: uid(), name: "", role: "" },
    ]);
    setOpen("members");
  }
  function updateMember(
    clientId: string,
    field: "name" | "role",
    value: string,
  ) {
    set(
      "members",
      values.members.map((member) =>
        member.clientId === clientId ? { ...member, [field]: value } : member,
      ),
    );
  }
  function removeMember(clientId: string) {
    set(
      "members",
      values.members.filter((member) => member.clientId !== clientId),
    );
    set(
      "artistMemberClientIds",
      values.artistMemberClientIds.filter((id) => id !== clientId),
    );
  }
  function addReference() {
    set("references", [
      ...values.references,
      { clientId: uid(), name: "", description: "" },
    ]);
    setOpen("art");
  }
  function updateReference(
    clientId: string,
    field: "name" | "description",
    value: string,
  ) {
    set(
      "references",
      values.references.map((reference) =>
        reference.clientId === clientId
          ? { ...reference, [field]: value }
          : reference,
      ),
    );
  }
  function section(id: string, title: string, content: React.ReactNode) {
    return (
      <section className="overflow-hidden rounded-[22px] border border-[#e1e6de] bg-white shadow-card">
        <button
          type="button"
          onClick={() => setOpen(open === id ? "" : id)}
          className="flex min-h-14 w-full items-center justify-between px-4 text-left font-bold"
        >
          {title}
          <Icon name="arrow" size={18} />
        </button>
        {open === id && (
          <div className="space-y-4 border-t border-[#edf0e8] p-4">
            {content}
          </div>
        )}
      </section>
    );
  }
  return (
    <AppFrame>
      <header className="mb-6 flex items-center gap-3">
        <a
          href={backHref}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
        >
          <Icon name="back" />
        </a>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-moss">
            Equipes
          </p>
          <h1 className="font-serif text-2xl font-bold">
            {mode === "create" ? "Nova equipe" : "Editar equipe"}
          </h1>
        </div>
      </header>
      <form onSubmit={submit} className="space-y-3">
        {section(
          "identification",
          "A. Identificação da equipe",
          <>
            <Input
              label="Nome da equipe"
              value={values.name}
              onChange={(value) => set("name", value)}
              required
            />
            <Input
              label="Nome do jogo"
              value={values.gameName}
              onChange={(value) => set("gameName", value)}
              required
            />
            <label className="block text-sm font-bold">
              Tema escolhido *
              <select
                required
                value={values.themeId}
                onChange={(event) => set("themeId", event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-[#dbe1d8] bg-white px-3 text-sm"
              >
                <option value="">Selecione um tema</option>
                {themes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </label>
            <Area
              label="Descrição do jogo"
              value={values.description}
              onChange={(value) => set("description", value)}
            />
            <Area
              label="Observações gerais"
              value={values.notes}
              onChange={(value) => set("notes", value)}
            />
          </>,
        )}
        {section(
          "members",
          "B. Integrantes",
          <>
            <button
              type="button"
              onClick={addMember}
              className="flex min-h-11 items-center gap-2 rounded-xl bg-[#edf2e9] px-3 text-sm font-bold text-moss"
            >
              <Icon name="plus" size={17} />
              Adicionar integrante
            </button>
            {values.members.map((member) => (
              <div
                key={member.clientId}
                className="space-y-2 rounded-2xl bg-[#f8f9f4] p-3"
              >
                <Input
                  label="Nome"
                  value={member.name}
                  onChange={(value) =>
                    updateMember(member.clientId, "name", value)
                  }
                />
                <Input
                  label="Função na equipe"
                  value={member.role}
                  onChange={(value) =>
                    updateMember(member.clientId, "role", value)
                  }
                />
                <button
                  type="button"
                  onClick={() => removeMember(member.clientId)}
                  className="text-xs font-bold text-[#974b3c]"
                >
                  Remover integrante
                </button>
              </div>
            ))}
          </>,
        )}
        {section(
          "game",
          "C. Informações do jogo",
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {textFields.map((field) => (
                <Input
                  key={field.key}
                  label={field.label}
                  value={values[field.key]}
                  onChange={(value) => set(field.key, value)}
                  placeholder={field.placeholder}
                />
              ))}
            </div>
            <Area
              label="Mecânica principal"
              value={values.mainMechanic}
              onChange={(value) => set("mainMechanic", value)}
            />
            <Area
              label="Diferencial do jogo"
              value={values.gameDifferential}
              onChange={(value) => set("gameDifferential", value)}
            />
            <label className="block text-sm font-bold">
              Estado atual
              <select
                value={values.currentState}
                onChange={(event) => set("currentState", event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-[#dbe1d8] bg-white px-3 text-sm"
              >
                <option value="">Não informado</option>
                {gameStates.map((state) => (
                  <option key={state}>{state}</option>
                ))}
              </select>
            </label>
          </>,
        )}
        {section(
          "art",
          "D. Direção de Arte",
          <>
            <div>
              <p className="mb-2 text-sm font-bold">Estilo visual</p>
              <div className="flex flex-wrap gap-2">
                {visualStyles.map((style) => (
                  <button
                    type="button"
                    key={style}
                    onClick={() =>
                      set(
                        "visualStyles",
                        values.visualStyles.includes(style)
                          ? values.visualStyles.filter((item) => item !== style)
                          : [...values.visualStyles, style],
                      )
                    }
                    className={`rounded-full px-3 py-2 text-xs font-bold ${values.visualStyles.includes(style) ? "bg-moss text-white" : "bg-[#f2f4ed] text-[#71807b]"}`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            {values.visualStyles.includes("Outro") && (
              <Input
                label="Especifique outro estilo"
                value={values.visualStyleOther}
                onChange={(value) => set("visualStyleOther", value)}
              />
            )}
            <Area
              label="Intenção artística"
              value={values.artisticIntent}
              onChange={(value) => set("artisticIntent", value)}
              placeholder="O que querem que o jogador sinta, perceba ou experimente ao olhar e interagir com o jogo?"
            />
            <div>
              <p className="mb-2 text-sm font-bold">Referências visuais</p>
              <button
                type="button"
                onClick={addReference}
                className="mb-3 flex min-h-11 items-center gap-2 rounded-xl bg-[#edf2e9] px-3 text-sm font-bold text-moss"
              >
                <Icon name="plus" size={17} />
                Adicionar referência
              </button>
              {values.references.map((reference) => (
                <div
                  key={reference.clientId}
                  className="mb-3 space-y-2 rounded-2xl bg-[#f8f9f4] p-3"
                >
                  <Input
                    label="Nome da referência"
                    value={reference.name}
                    onChange={(value) =>
                      updateReference(reference.clientId, "name", value)
                    }
                  />
                  <Area
                    label="O que será utilizado como referência?"
                    value={reference.description}
                    onChange={(value) =>
                      updateReference(reference.clientId, "description", value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "references",
                        values.references.filter(
                          (item) => item.clientId !== reference.clientId,
                        ),
                      )
                    }
                    className="text-xs font-bold text-[#974b3c]"
                  >
                    Remover referência
                  </button>
                </div>
              ))}
            </div>
            <Area
              label="Paleta de cores planejada"
              value={values.plannedPalette}
              onChange={(value) => set("plannedPalette", value)}
            />
            <Input
              label="Ferramentas artísticas"
              value={values.artTools}
              onChange={(value) => set("artTools", value)}
            />
            <Area
              label="Principal desafio artístico"
              value={values.mainArtChallenge}
              onChange={(value) => set("mainArtChallenge", value)}
              placeholder="Qual é o maior desafio artístico da equipe?"
            />
            <div>
              <p className="mb-2 text-sm font-bold">Responsáveis pela arte</p>
              {values.members.length === 0 ? (
                <p className="text-sm text-[#81908b]">
                  Adicione integrantes para selecionar responsáveis.
                </p>
              ) : (
                values.members.map((member) => (
                  <label
                    key={member.clientId}
                    className="flex min-h-12 items-center gap-3 border-b border-[#edf0e8] text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={values.artistMemberClientIds.includes(
                        member.clientId,
                      )}
                      onChange={() =>
                        set(
                          "artistMemberClientIds",
                          values.artistMemberClientIds.includes(member.clientId)
                            ? values.artistMemberClientIds.filter(
                                (id) => id !== member.clientId,
                              )
                            : [
                                ...values.artistMemberClientIds,
                                member.clientId,
                              ],
                        )
                      }
                      className="h-5 w-5 accent-moss"
                    />
                    <span>
                      {member.name || "Integrante sem nome"}
                      <small className="ml-2 text-[#81908b]">
                        {member.role}
                      </small>
                    </span>
                  </label>
                ))
              )}
            </div>
          </>,
        )}
        {error && (
          <p className="rounded-xl bg-[#f8e4df] p-3 text-sm text-[#974b3c]">
            {error}
          </p>
        )}
        <button
          disabled={saving}
          className="safe-bottom min-h-14 w-full rounded-2xl bg-ink text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar equipe"}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={() => void onDelete()}
            className="min-h-12 w-full rounded-2xl border border-[#e7b8ad] text-sm font-bold text-[#974b3c]"
          >
            Excluir equipe
          </button>
        )}
      </form>
    </AppFrame>
  );
}
