-- Succulentario: BETA in public, freemium separata nello STESSO progetto.
-- Applicare una volta al progetto BETA esistente. Non sposta/copia dati personali.
begin;
set local lock_timeout = '5s';

create schema freemium;
create schema if not exists app_private;
revoke all on schema freemium, app_private from public, anon, authenticated;
grant usage on schema freemium to authenticated, service_role;

-- Fotografia degli utenti BETA prima di aprire le iscrizioni pubbliche.
create table app_private.beta_members (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table app_private.beta_members enable row level security;
insert into app_private.beta_members select id from auth.users;
revoke all on app_private.beta_members from public, anon, authenticated;
create function public.succulentario_beta_access() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from app_private.beta_members where user_id = auth.uid());
$$;
revoke all on function public.succulentario_beta_access() from public, anon;
grant execute on function public.succulentario_beta_access() to authenticated;

-- Nuove tabelle con le stesse colonne, senza le righe della BETA.
create type freemium.plant_kind as enum ('collection','wishlist','lost');
create table freemium.plants (like public.plants including all);
alter table freemium.plants alter column kind drop default;
alter table freemium.plants alter column kind type freemium.plant_kind using kind::text::freemium.plant_kind;
alter table freemium.plants alter column kind set default 'collection'::freemium.plant_kind;
alter table freemium.plants add foreign key(owner) references auth.users(id) on delete cascade;
alter table freemium.plants add unique(id,owner);
create table freemium.plant_photos (like public.plant_photos including all);
alter table freemium.plant_photos add foreign key(owner) references auth.users(id) on delete cascade;
alter table freemium.plant_photos add foreign key(plant_id,owner) references freemium.plants(id,owner) on delete cascade;
create table freemium.calendar_events (like public.calendar_events including all);
alter table freemium.calendar_events add foreign key(owner) references auth.users(id) on delete cascade;
create table freemium.identifications (like public.identifications including all);
alter table freemium.identifications add foreign key(owner) references auth.users(id) on delete cascade;
alter table freemium.identifications add foreign key(plant_id) references freemium.plants(id) on delete set null;
alter table freemium.plants enable row level security;
alter table freemium.plant_photos enable row level security;
alter table freemium.calendar_events enable row level security;
alter table freemium.identifications enable row level security;

create table freemium.access_requests (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  status text not null default 'pending' check(status in ('pending','approved','rejected')),
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
alter table freemium.access_requests enable row level security;
revoke all on freemium.access_requests from public, anon, authenticated;
grant select on freemium.access_requests to authenticated;
grant update(status) on freemium.access_requests to authenticated;

create function freemium.is_access_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from freemium.access_requests where user_id = auth.uid() and is_admin and status = 'approved');
$$;
create function freemium.has_approved_access() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from freemium.access_requests where user_id = auth.uid() and status = 'approved');
$$;

-- Non esiste un trigger globale su auth.users: iscriversi/entrare nella BETA
-- non aggiunge richieste freemium. L'identità viene letta dalla sessione verificata.
create function freemium.request_access() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Non autenticato'; end if;
  insert into freemium.access_requests(user_id,email)
  select id,email from auth.users where id = auth.uid() and email_confirmed_at is not null
  on conflict(user_id) do nothing;
end;
$$;

create policy access_read on freemium.access_requests for select to authenticated
  using(user_id = auth.uid() or freemium.is_access_admin());
create policy access_admin_update on freemium.access_requests for update to authenticated
  using(freemium.is_access_admin() and user_id <> auth.uid() and not is_admin)
  with check(not is_admin and user_id <> auth.uid());
insert into freemium.access_requests(user_id,email,status,is_admin)
select id,email,'approved',true from auth.users where lower(email) = 'galano.raffaele@gmail.com' and email_confirmed_at is not null;
do $$ begin
  if not exists(select 1 from freemium.access_requests where is_admin) then
    raise exception 'Amministratore verificato non trovato: nessuna modifica applicata';
  end if;
end $$;

do $$ declare t text; begin
  foreach t in array array['plants','plant_photos','calendar_events','identifications'] loop
    execute format('alter table freemium.%I enable row level security', t);
    execute format('revoke all on freemium.%I from public, anon, authenticated', t);
    execute format('grant select,insert,update,delete on freemium.%I to authenticated', t);
    execute format('create policy owner_approved on freemium.%I for all to authenticated using(owner = auth.uid() and freemium.has_approved_access()) with check(owner = auth.uid() and freemium.has_approved_access())', t);
    execute format('create policy beta_members_only on public.%I as restrictive for all to authenticated using(public.succulentario_beta_access()) with check(public.succulentario_beta_access())', t);
  end loop;
end $$;

create function freemium.enforce_plant_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  -- NO KEY UPDATE non confligge con i lock delle foreign key degli INSERT.
  perform 1 from auth.users where id = new.owner for no key update;
  if (select count(*) from freemium.plants where owner = new.owner) > 5 then
    raise exception 'Hai raggiunto il limite di 5 schede della versione freemium. Elimina una scheda prima di aggiungerne un’altra.' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger freemium_plant_limit after insert or update of owner on freemium.plants
  for each row execute function freemium.enforce_plant_limit();
create function freemium.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger plants_set_updated_at before update on freemium.plants
  for each row execute function freemium.set_updated_at();

insert into storage.buckets(id,name,public) values('foto-freemium','foto-freemium',false);
create policy freemium_foto_owner on storage.objects for all to authenticated
  using(bucket_id = 'foto-freemium' and (storage.foldername(name))[1] = auth.uid()::text and freemium.has_approved_access())
  with check(bucket_id = 'foto-freemium' and (storage.foldername(name))[1] = auth.uid()::text and freemium.has_approved_access());
create policy beta_foto_members_only on storage.objects as restrictive for all to authenticated
  using(bucket_id <> 'foto' or public.succulentario_beta_access())
  with check(bucket_id <> 'foto' or public.succulentario_beta_access());

revoke all on all functions in schema freemium from public, anon, authenticated;
grant execute on function freemium.is_access_admin(), freemium.has_approved_access(), freemium.request_access() to authenticated;
grant all on all tables in schema freemium to service_role;
notify pgrst, 'reload schema';
commit;
