drop policy if exists "members can insert mentors" on public.mentors;
drop policy if exists "mentors can update own profile" on public.mentors;
drop policy if exists "members can remove other mentors" on public.mentors;

create policy "members can insert mentors"
on public.mentors for insert to authenticated
with check (public.is_jam_member(jam_id));

create policy "mentors can update own profile"
on public.mentors for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "members can remove other mentors"
on public.mentors for delete to authenticated
using (user_id <> auth.uid() and public.is_jam_member(jam_id));
