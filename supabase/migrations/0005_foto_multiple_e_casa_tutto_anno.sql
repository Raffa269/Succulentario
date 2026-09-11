-- Due richieste dopo la prova dell'app (settembre 2026):
-- 1) più foto per pianta nel tempo, per seguirne la crescita;
-- 2) un'annotazione per pianta: "può stare in casa tutto l'anno".

alter table plants
  add column casa_tutto_anno boolean not null default false;

create table plant_photos (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null references auth.users(id) on delete cascade,
  plant_id    uuid not null references plants(id) on delete cascade,
  photo_path  text not null,
  created_at  timestamptz not null default now()
);

create index plant_photos_plant_id_idx on plant_photos (plant_id, created_at);

alter table plant_photos enable row level security;

create policy "plant_photos: solo il proprietario" on plant_photos
  for all
  using (owner = auth.uid())
  with check (owner = auth.uid());

-- Vedi 0003_grants.sql: "Automatically expose new tables" è disattivato,
-- va concesso a mano o si ripete "permission denied for table plant_photos".
grant select, insert, update, delete on table plant_photos to authenticated;
