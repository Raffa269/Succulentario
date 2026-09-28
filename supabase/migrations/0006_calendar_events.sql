-- Diario mensile degli interventi: irrigazioni, fertilizzazioni,
-- propagazioni e note libere.

create table calendar_events (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null references auth.users(id) on delete cascade,
  event_date  date not null,
  kind        text not null check (kind in ('irrigazione', 'fertilizzazione', 'propagazione', 'nota')),
  note        text not null default '',
  created_at  timestamptz not null default now()
);

create index calendar_events_owner_date_idx on calendar_events (owner, event_date desc);

alter table calendar_events enable row level security;

create policy "calendar_events: solo il proprietario" on calendar_events
  for all
  using (owner = auth.uid())
  with check (owner = auth.uid());

grant select, insert, update, delete on table calendar_events to authenticated;
