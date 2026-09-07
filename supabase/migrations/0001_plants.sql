-- Tappa 3: collezione, wishlist, cimitero. Vedi SPECIFICA.md §6.
-- Solo i dati personali stanno in tabella: il catalogo (generi, varietà,
-- guida) resta nei JSON di dati/, versionati nel repo.

create type plant_kind as enum ('collection', 'wishlist', 'lost');

create table plants (
  id           uuid primary key default gen_random_uuid(),
  owner        uuid not null references auth.users(id) on delete cascade,
  kind         plant_kind not null default 'collection',
  num          integer,                    -- numero di catalogo, solo per kind='collection'
  name         text not null,
  genus_id     text,                       -- id del genere, es. 'haworthia'
  var_key      text,                       -- chiave della varietà schedata, o null
  photo_path   text,                       -- percorso nel bucket 'foto', mai un data URL
  purchase_ym  text,                       -- 'AAAA-MM'
  prop_soil    boolean not null default false,
  prop_hum     boolean not null default false,
  notes        text not null default '',
  added_at     timestamptz not null default now(),
  -- solo per kind='lost'
  lost_ym      text,
  cause        text,
  lesson       text,
  updated_at   timestamptz not null default now()
);

create index plants_owner_kind_idx on plants (owner, kind);
create index plants_owner_var_key_idx on plants (owner, var_key);

alter table plants enable row level security;

create policy "plants: solo il proprietario" on plants
  for all
  using (owner = auth.uid())
  with check (owner = auth.uid());

-- Tiene updated_at coerente senza doverci pensare a ogni update lato app.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger plants_set_updated_at
  before update on plants
  for each row
  execute function set_updated_at();

-- Bucket privato per le foto: URL firmati, mai pubblici (SPECIFICA.md §9).
insert into storage.buckets (id, name, public)
values ('foto', 'foto', false)
on conflict (id) do nothing;

-- Ogni utente può leggere/scrivere solo dentro la propria cartella
-- (percorso "<uid>/...", verificato sul primo segmento del path).
create policy "foto: solo il proprietario legge"
  on storage.objects for select
  using (bucket_id = 'foto' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "foto: solo il proprietario carica"
  on storage.objects for insert
  with check (bucket_id = 'foto' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "foto: solo il proprietario aggiorna"
  on storage.objects for update
  using (bucket_id = 'foto' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "foto: solo il proprietario cancella"
  on storage.objects for delete
  using (bucket_id = 'foto' and (storage.foldername(name))[1] = auth.uid()::text);
