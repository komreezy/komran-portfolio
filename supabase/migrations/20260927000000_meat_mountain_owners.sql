create table if not exists public.meat_mountain_owners (
  league_id text not null,
  user_id text not null,
  name text not null default '' check (char_length(name) <= 40),
  updated_at timestamptz not null default now(),
  primary key (league_id, user_id)
);
alter table public.meat_mountain_owners enable row level security;
grant select on public.meat_mountain_owners to anon, authenticated;
grant all on public.meat_mountain_owners to service_role;
create policy "Public owner names" on public.meat_mountain_owners for select to anon, authenticated using (true);
