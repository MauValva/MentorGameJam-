alter table public.teams
  add column if not exists genre text,
  add column if not exists platform text,
  add column if not exists dimension text,
  add column if not exists camera text,
  add column if not exists target_audience text,
  add column if not exists main_mechanic text,
  add column if not exists game_differential text,
  add column if not exists current_state text,
  add column if not exists visual_styles text[] not null default '{}',
  add column if not exists visual_style_other text,
  add column if not exists artistic_intent text,
  add column if not exists planned_palette text,
  add column if not exists art_tools text,
  add column if not exists main_art_challenge text;

alter table public.team_members
  add constraint team_members_team_id_id_key unique (team_id, id);

create table public.team_visual_references (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  description text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_artists (
  team_id uuid not null references public.teams(id) on delete cascade,
  team_member_id uuid not null,
  primary key (team_id, team_member_id),
  constraint team_artists_same_team_member
    foreign key (team_id, team_member_id)
    references public.team_members(team_id, id)
    on delete cascade
);

alter table public.team_visual_references enable row level security;
alter table public.team_artists enable row level security;

create policy "jam members can manage visual references"
on public.team_visual_references for all to authenticated
using (exists (select 1 from public.teams t where t.id = team_id and public.is_jam_member(t.jam_id)))
with check (exists (select 1 from public.teams t where t.id = team_id and public.is_jam_member(t.jam_id)));

create policy "jam members can manage team artists"
on public.team_artists for all to authenticated
using (exists (select 1 from public.teams t where t.id = team_id and public.is_jam_member(t.jam_id)))
with check (exists (select 1 from public.teams t where t.id = team_id and public.is_jam_member(t.jam_id)));

create or replace function public.save_team_bundle(
  p_team_id uuid,
  p_jam_id uuid,
  p_name text,
  p_game_name text,
  p_theme_id uuid,
  p_engine text,
  p_description text,
  p_notes text,
  p_genre text,
  p_platform text,
  p_dimension text,
  p_camera text,
  p_target_audience text,
  p_main_mechanic text,
  p_game_differential text,
  p_current_state text,
  p_visual_styles text[],
  p_visual_style_other text,
  p_artistic_intent text,
  p_planned_palette text,
  p_art_tools text,
  p_main_art_challenge text,
  p_members jsonb,
  p_references jsonb,
  p_artist_member_client_ids text[],
  p_relationships_loaded boolean
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_team_id uuid := p_team_id;
  v_member jsonb;
  v_reference jsonb;
  v_member_id uuid;
  v_reference_id uuid;
  v_member_map jsonb := '{}'::jsonb;
  v_reference_map jsonb := '{}'::jsonb;
begin
  if auth.uid() is null or not public.is_jam_member(p_jam_id) then
    raise exception 'Usuário não autorizado para esta Game Jam';
  end if;
  if not p_relationships_loaded or p_members is null or p_references is null or p_artist_member_client_ids is null then
    raise exception 'Payload de relacionamentos incompleto';
  end if;
  if nullif(trim(p_name), '') is null or nullif(trim(p_game_name), '') is null then
    raise exception 'Nome da equipe e nome do jogo são obrigatórios';
  end if;
  if not exists (select 1 from public.themes where id = p_theme_id and jam_id = p_jam_id) then
    raise exception 'Tema inválido para esta Game Jam';
  end if;

  if v_team_id is null then
    insert into public.teams (jam_id, name, game_name, theme_id, engine, description, general_notes, genre, platform, dimension, camera, target_audience, main_mechanic, game_differential, current_state, visual_styles, visual_style_other, artistic_intent, planned_palette, art_tools, main_art_challenge)
    values (p_jam_id, trim(p_name), trim(p_game_name), p_theme_id, p_engine, p_description, p_notes, p_genre, p_platform, p_dimension, p_camera, p_target_audience, p_main_mechanic, p_game_differential, p_current_state, coalesce(p_visual_styles, '{}'), p_visual_style_other, p_artistic_intent, p_planned_palette, p_art_tools, p_main_art_challenge)
    returning id into v_team_id;
  else
    if not exists (select 1 from public.teams where id = v_team_id and jam_id = p_jam_id) then
      raise exception 'Equipe não pertence a esta Game Jam';
    end if;
    update public.teams set name = trim(p_name), game_name = trim(p_game_name), theme_id = p_theme_id, engine = p_engine, description = p_description, general_notes = p_notes, genre = p_genre, platform = p_platform, dimension = p_dimension, camera = p_camera, target_audience = p_target_audience, main_mechanic = p_main_mechanic, game_differential = p_game_differential, current_state = p_current_state, visual_styles = coalesce(p_visual_styles, '{}'), visual_style_other = p_visual_style_other, artistic_intent = p_artistic_intent, planned_palette = p_planned_palette, art_tools = p_art_tools, main_art_challenge = p_main_art_challenge, updated_at = now() where id = v_team_id;
  end if;

  for v_member in select * from jsonb_array_elements(p_members) loop
    if nullif(v_member->>'name', '') is null or nullif(v_member->>'role', '') is null then
      raise exception 'Integrante sem nome ou função';
    end if;
    if nullif(v_member->>'id', '') is not null then
      v_member_id := (v_member->>'id')::uuid;
      if not exists (select 1 from public.team_members where id = v_member_id and team_id = v_team_id) then raise exception 'Integrante inválido para esta equipe'; end if;
      update public.team_members set name = trim(v_member->>'name'), role = trim(v_member->>'role'), updated_at = now() where id = v_member_id;
    else
      insert into public.team_members (team_id, name, role) values (v_team_id, trim(v_member->>'name'), trim(v_member->>'role')) returning id into v_member_id;
    end if;
    v_member_map := v_member_map || jsonb_build_object(v_member->>'clientId', v_member_id::text);
  end loop;
  delete from public.team_members where team_id = v_team_id and not exists (select 1 from jsonb_each_text(v_member_map) mapped where mapped.value = public.team_members.id::text);

  for v_reference in select * from jsonb_array_elements(p_references) loop
    if nullif(v_reference->>'name', '') is null or nullif(v_reference->>'description', '') is null then raise exception 'Referência sem nome ou descrição'; end if;
    if nullif(v_reference->>'id', '') is not null then
      v_reference_id := (v_reference->>'id')::uuid;
      if not exists (select 1 from public.team_visual_references where id = v_reference_id and team_id = v_team_id) then raise exception 'Referência inválida para esta equipe'; end if;
      update public.team_visual_references set name = trim(v_reference->>'name'), description = trim(v_reference->>'description'), sort_order = coalesce((v_reference->>'sortOrder')::integer, 0), updated_at = now() where id = v_reference_id;
    else
      insert into public.team_visual_references (team_id, name, description, sort_order) values (v_team_id, trim(v_reference->>'name'), trim(v_reference->>'description'), coalesce((v_reference->>'sortOrder')::integer, 0)) returning id into v_reference_id;
    end if;
    v_reference_map := v_reference_map || jsonb_build_object(v_reference->>'clientId', v_reference_id::text);
  end loop;
  delete from public.team_visual_references where team_id = v_team_id and not exists (select 1 from jsonb_each_text(v_reference_map) mapped where mapped.value = public.team_visual_references.id::text);
  delete from public.team_artists where team_id = v_team_id;
  insert into public.team_artists (team_id, team_member_id)
  select v_team_id, (v_member_map->>member_client_id)::uuid
  from unnest(p_artist_member_client_ids) member_client_id
  where v_member_map ? member_client_id;

  return jsonb_build_object('team_id', v_team_id);
end;
$$;

revoke all on function public.save_team_bundle(uuid, uuid, text, text, uuid, text, text, text, text, text, text, text, text, text, text, text, text[], text, text, text, text, text, jsonb, jsonb, text[], boolean) from public;
grant execute on function public.save_team_bundle(uuid, uuid, text, text, uuid, text, text, text, text, text, text, text, text, text, text, text, text[], text, text, text, text, text, jsonb, jsonb, text[], boolean) to authenticated;
