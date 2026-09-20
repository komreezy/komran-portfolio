create table if not exists public.meat_mountain_weeks (
 season integer not null, week integer not null check(week between 1 and 18),
 payload jsonb not null, updated_at timestamptz not null default now(),
 primary key(season,week)
);
create table if not exists public.meat_mountain_snapshots (
 id bigint generated always as identity primary key,
 season integer not null, week integer not null,
 at timestamptz not null, teams jsonb not null, events jsonb not null default '[]', hash text not null,
 unique(season,week,at)
);
create index if not exists meat_mountain_history on public.meat_mountain_snapshots(season,week,at);
alter table public.meat_mountain_weeks enable row level security;
alter table public.meat_mountain_snapshots enable row level security;
create policy "Public race standings" on public.meat_mountain_weeks for select using(true);
create policy "Public race replay" on public.meat_mountain_snapshots for select using(true);
grant select on public.meat_mountain_weeks,public.meat_mountain_snapshots to anon,authenticated;
create or replace function public.record_meat_mountain(p_season integer,p_week integer,p_at timestamptz,p_payload jsonb,p_teams jsonb,p_hash text) returns void
language plpgsql security definer set search_path=public as $$
declare previous public.meat_mountain_snapshots; notes jsonb:='[]'; old_high text; new_high text; old_low text; new_low text;
begin
 perform pg_advisory_xact_lock(1341855945,p_season*100+p_week);
 select * into previous from meat_mountain_snapshots where season=p_season and week=p_week order by at desc limit 1;
 if previous.at is not null and previous.at>=p_at then return; end if;
 insert into meat_mountain_weeks values(p_season,p_week,p_payload,p_at) on conflict(season,week) do update set payload=excluded.payload,updated_at=excluded.updated_at;
 if previous.id is null or previous.hash<>p_hash or (p_payload->>'phase'<>'final' and p_at-previous.at>=interval '5 minutes') then
  if previous.id is not null then
   old_high:=previous.teams->0->>'id';new_high:=p_teams->0->>'id';
   old_low:=previous.teams->-1->>'id';new_low:=p_teams->-1->>'id';
   if old_high<>new_high then notes:=notes||jsonb_build_array('Summit lead changed');end if;
   if old_low<>new_low then notes:=notes||jsonb_build_array('Last place changed');end if;
   if exists(select 1 from jsonb_array_elements(p_teams) n join jsonb_array_elements(previous.teams) o on n->>'id'=o->>'id' where abs((n->>'projected')::numeric-(o->>'projected')::numeric)>=8) then notes:=notes||jsonb_build_array('Big projection swing');end if;
   if exists(select 1 from jsonb_array_elements(p_teams) n join jsonb_array_elements(previous.teams) o on n->>'id'=o->>'id' where (n->>'active')::int+(n->>'remaining')::int<(o->>'active')::int+(o->>'remaining')::int) then notes:=notes||jsonb_build_array('Another starter finished');end if;
  end if;
  if p_payload->>'phase'='final' then notes:=notes||jsonb_build_array('Final result');end if;
  insert into meat_mountain_snapshots(season,week,at,teams,events,hash) values(p_season,p_week,p_at,p_teams,notes,p_hash);
 end if;
end $$;
revoke all on function public.record_meat_mountain(integer,integer,timestamptz,jsonb,jsonb,text) from public,anon,authenticated;
grant execute on function public.record_meat_mountain(integer,integer,timestamptz,jsonb,jsonb,text) to service_role;

-- The scheduler stays cheap: hourly outside games, every minute from 15 minutes
-- before kickoff until six hours after. Setup puts the bearer token in Vault.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
create or replace function public.collect_meat_mountain_if_due() returns void
language plpgsql security definer set search_path=public,pg_catalog as $$
declare token text; latest jsonb; due boolean;
begin
 select payload into latest from meat_mountain_weeks order by season desc,week desc limit 1;
 due:=extract(minute from now())=0 or latest is null;
 if not due then
  select exists(select 1 from jsonb_array_elements(latest->'teams') t,
   jsonb_array_elements(t->'players') p
   where p->>'kickoff' is not null and now() between (p->>'kickoff')::timestamptz-interval '15 minutes' and (p->>'kickoff')::timestamptz+interval '6 hours') into due;
 end if;
 if not due then return;end if;
 select decrypted_secret into token from vault.decrypted_secrets where name='meat_mountain_collector' limit 1;
 if token is null then return;end if;
 perform net.http_get(url:='https://www.komran.com/api/meat-mountain/collect',headers:=jsonb_build_object('Authorization','Bearer '||token),timeout_milliseconds:=60000);
end $$;
revoke all on function public.collect_meat_mountain_if_due() from public,anon,authenticated;
select cron.schedule('weekly-meat-mountain','* * * * *','select public.collect_meat_mountain_if_due()');
