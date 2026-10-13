import { BottomNav } from "./bottom-nav";

export function AppFrame({ children, active, className = "" }: { children: React.ReactNode; active?: "teams" | "evaluations" | "settings"; className?: string }) {
  return <main className={`mx-auto min-h-screen w-full max-w-[430px] bg-paper px-5 pb-28 pt-[max(1.5rem,env(safe-area-inset-top))] ${className}`}>{children}<BottomNav active={active} /></main>;
}
