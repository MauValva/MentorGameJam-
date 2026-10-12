type IconProps = { size?: number; stroke?: number };
type IconName = "search" | "plus" | "users" | "check" | "alert" | "arrow" | "gear" | "star" | "back" | "edit" | "clock" | "trash";

export function Icon({ name, size = 20, stroke = 1.8 }: IconProps & { name: IconName }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    alert: <><path d="M10.3 3.6 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
    arrow: <><path d="m9 18 6-6-6-6" /></>,
    gear: <><path d="M12 2.5 13.5 4l2-.2.8-1.9 2.3 1.3-.4 2 1.5 1.4 2-.4 1.3 2.3-1.8.9.1 2 1.5 1.4-1.3 2.3-2-.5-1.4 1.5.4 2-2.3 1.3-1-1.8-2 .2-1.3 1.6-2.3-1.3.4-2-1.5-1.4-2 .4-1.3-2.3 1.8-1-.2-2-1.5-1.3 1.3-2.3 2 .4 1.5-1.5-.4-2 2.3-1.3 1 1.8 2-.2Z" /><circle cx="12" cy="12" r="3" /></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    back: <><path d="m15 18-6-6 6-6" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    trash: <><path d="M4 7h16" /><path d="M10 11v6M14 11v6" /><path d="M6 7l1 14h10l1-14" /><path d="M9 7V4h6v3" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}
