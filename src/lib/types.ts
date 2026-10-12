export type DatabaseTeam = {
  id: string;
  name: string;
  game_name: string;
  engine: string | null;
  current_state: string | null;
  description: string | null;
  general_notes: string | null;
  theme_id: string;
  themes: { name: string } | null;
  team_members?: { id: string }[] | null;
  visits?: { id: string; needs_revisit: boolean; revisit_reason: string | null; visited_at: string }[] | null;
};

export type DatabaseTheme = { id: string; name: string; description: string | null };

export type Team = {
  id: string;
  name: string;
  game: string;
  theme: string;
  engine: string;
  currentState?: string;
  members: number;
  visits: number;
  revisit?: string;
  accent: string;
};
