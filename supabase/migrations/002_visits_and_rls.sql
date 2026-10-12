do $$ begin
  create type public.visit_status as enum ('bem', 'atencao', 'problema');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.interaction_level as enum ('ruim', 'normal', 'bom');
exception when duplicate_object then null;
end $$;

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete restrict,
  mentor_id uuid not null references public.mentors(id) on delete restrict,
  status public.visit_status,
  tags text[] not null default '{}',
  notes text not null,
  communication public.interaction_level,
  receptivity public.interaction_level,
  mentoring_use public.interaction_level,
  needs_revisit boolean not null default false,
  revisit_reason text,
  visited_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint visits_revisit_reason_valid check (needs_revisit = true or revisit_reason is null),
  constraint visits_revisit_requires_reason check (needs_revisit = false or nullif(trim(revisit_reason), '') is not null)
);

create or replace function public.is_jam_member(target_jam_id uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.mentors where jam_id = target_jam_id and user_id = auth.uid());
$$;

alter table public.jams enable row level security;
alter table public.mentors enable row level security;
alter table public.themes enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.visits enable row level security;
alter table public.evaluation_criteria enable row level security;
alter table public.evaluations enable row level security;
alter table public.evaluation_scores enable row level security;

drop policy if exists "jam members can read jams" on public.jams;
drop policy if exists "mentors can read own membership" on public.mentors;
drop policy if exists "members can insert mentors" on public.mentors;
drop policy if exists "mentors can update own profile" on public.mentors;
drop policy if exists "members can remove other mentors" on public.mentors;
drop policy if exists "jam members can manage themes" on public.themes;
drop policy if exists "jam members can manage teams" on public.teams;
drop policy if exists "jam members can manage criteria" on public.evaluation_criteria;
drop policy if exists "jam members can manage team members" on public.team_members;
drop policy if exists "jam members can read visits" on public.visits;
drop policy if exists "mentors can create visits" on public.visits;
drop policy if exists "mentors can update own visits" on public.visits;
drop policy if exists "jam members can read evaluations" on public.evaluations;
drop policy if exists "mentors can manage own evaluations" on public.evaluations;
drop policy if exists "jam members can read scores" on public.evaluation_scores;
drop policy if exists "mentors can manage own scores" on public.evaluation_scores;

create policy "jam members can read jams" on public.jams for select to authenticated using (public.is_jam_member(id));
create policy "mentors can read own membership" on public.mentors for select to authenticated using (user_id = auth.uid());
create policy "members can insert mentors" on public.mentors for insert to authenticated with check (public.is_jam_member(jam_id));
create policy "mentors can update own profile" on public.mentors for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "members can remove other mentors" on public.mentors for delete to authenticated using (user_id <> auth.uid() and public.is_jam_member(jam_id));
create policy "jam members can manage themes" on public.themes for all to authenticated using (public.is_jam_member(jam_id)) with check (public.is_jam_member(jam_id));
create policy "jam members can manage teams" on public.teams for all to authenticated using (public.is_jam_member(jam_id)) with check (public.is_jam_member(jam_id));
create policy "jam members can manage criteria" on public.evaluation_criteria for all to authenticated using (public.is_jam_member(jam_id)) with check (public.is_jam_member(jam_id));
create policy "jam members can manage team members" on public.team_members for all to authenticated using (exists (select 1 from public.teams t where t.id = team_id and public.is_jam_member(t.jam_id))) with check (exists (select 1 from public.teams t where t.id = team_id and public.is_jam_member(t.jam_id)));
create policy "jam members can read visits" on public.visits for select to authenticated using (exists (select 1 from public.teams t where t.id = team_id and public.is_jam_member(t.jam_id)));
create policy "mentors can create visits" on public.visits for insert to authenticated with check (exists (select 1 from public.mentors m join public.teams t on t.jam_id = m.jam_id where m.id = mentor_id and m.user_id = auth.uid() and t.id = team_id));
create policy "mentors can update own visits" on public.visits for update to authenticated using (exists (select 1 from public.mentors m where m.id = mentor_id and m.user_id = auth.uid()));
create policy "jam members can read evaluations" on public.evaluations for select to authenticated using (exists (select 1 from public.teams t where t.id = team_id and public.is_jam_member(t.jam_id)));
create policy "mentors can manage own evaluations" on public.evaluations for all to authenticated using (exists (select 1 from public.mentors m where m.id = mentor_id and m.user_id = auth.uid())) with check (exists (select 1 from public.mentors m where m.id = mentor_id and m.user_id = auth.uid()));
create policy "jam members can read scores" on public.evaluation_scores for select to authenticated using (exists (select 1 from public.evaluations e join public.teams t on t.id = e.team_id where e.id = evaluation_id and public.is_jam_member(t.jam_id)));
create policy "mentors can manage own scores" on public.evaluation_scores for all to authenticated using (exists (select 1 from public.evaluations e join public.mentors m on m.id = e.mentor_id where e.id = evaluation_id and m.user_id = auth.uid())) with check (exists (select 1 from public.evaluations e join public.mentors m on m.id = e.mentor_id where e.id = evaluation_id and m.user_id = auth.uid()));
