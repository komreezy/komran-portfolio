create table if not exists public.tortalona_document (
  id integer primary key check (id = 1),
  revision bigint not null default 0 check (revision >= 0),
  seasons jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.tortalona_document enable row level security;
grant select on public.tortalona_document to anon, authenticated;
grant all on public.tortalona_document to service_role;
create policy "Public Tortalona leaderboard" on public.tortalona_document
  for select to anon, authenticated using (id = 1);

insert into public.tortalona_document (id, revision, seasons)
values (1, 0, '[{"id":"current","name":"Current season","baselineGame":5,"totalGames":9,"players":[],"games":[]}]'::jsonb)
on conflict (id) do nothing;
