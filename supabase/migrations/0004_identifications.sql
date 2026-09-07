-- Tappa 5: log delle identificazioni (SPECIFICA.md §6, §8.2). Serve a non
-- ripagare due volte la stessa foto e a capire cosa funziona.
create table identifications (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null references auth.users(id) on delete cascade,
  plant_id    uuid references plants(id) on delete set null,
  source      text not null,               -- 'plantnet' | 'gemini-photo'
  raw         jsonb,
  candidates  jsonb,
  chosen      text,
  created_at  timestamptz not null default now()
);

create index identifications_owner_idx on identifications (owner);

alter table identifications enable row level security;

create policy identifications_owner_all on identifications
  for all
  using (owner = auth.uid())
  with check (owner = auth.uid());

-- Vedi supabase/migrations/0003_grants.sql: "Automatically expose new
-- tables" è disattivato, va concesso a mano o si ripete lo stesso errore
-- "permission denied for table identifications".
grant select, insert, update, delete on table identifications to authenticated;
