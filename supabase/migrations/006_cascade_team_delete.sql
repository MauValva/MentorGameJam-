-- Exclui todos os dados dependentes quando uma equipe é removida.
-- Esta migration ainda não foi aplicada remotamente.
alter table public.visits
  drop constraint if exists visits_team_id_fkey,
  add constraint visits_team_id_fkey
    foreign key (team_id) references public.teams(id) on delete cascade;

alter table public.evaluations
  drop constraint if exists evaluations_team_id_fkey,
  add constraint evaluations_team_id_fkey
    foreign key (team_id) references public.teams(id) on delete cascade;
