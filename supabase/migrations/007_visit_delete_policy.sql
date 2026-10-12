create policy "mentors can delete own visits"
on public.visits
for delete
to authenticated
using (
  exists (
    select 1
    from public.mentors m
    join public.teams t on t.jam_id = m.jam_id
    where m.id = mentor_id
      and m.user_id = auth.uid()
      and t.id = team_id
  )
);
