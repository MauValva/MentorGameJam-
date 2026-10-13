import Link from "next/link";
import { Icon } from "./icons";

export function BottomNav({ active = "teams" }: { active?: "teams" | "evaluations" | "settings" }) {
  const items = [{ href: "/equipes", label: "Equipes", icon: "users", key: "teams" }, { href: "/avaliacoes", label: "Avaliações", icon: "star", key: "evaluations" }, { href: "/configuracoes", label: "Configurações", icon: "gear", key: "settings" }] as const;
  return <nav className="safe-bottom fixed bottom-0 left-1/2 z-20 flex w-full max-w-[430px] -translate-x-1/2 justify-around border-t border-border bg-surface/95 px-4 pt-3 backdrop-blur">
    {items.map((item) => <Link key={item.key} href={item.href} className={`flex min-w-[76px] flex-col items-center gap-1 text-[11px] font-semibold transition ${active === item.key ? "text-moss" : "text-[#ada3bb]"}`}><Icon name={item.icon} size={21} /><span>{item.label}</span></Link>)}
  </nav>;
}
