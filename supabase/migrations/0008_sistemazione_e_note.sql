begin;

alter table public.plants
  add column if not exists sistemazione text check (sistemazione in ('in casa', 'terrazzo coperto', 'terrazzo scoperto')),
  add column if not exists orientamento text check (orientamento in ('nord', 'nord-est', 'est', 'sud-est', 'sud', 'sud-ovest', 'ovest', 'nord-ovest')),
  add column if not exists note_entries jsonb not null default '[]'::jsonb check (jsonb_typeof(note_entries) = 'array');

-- Aggiornamenti atomici: due schede aperte non sovrascrivono le rispettive note.
-- SECURITY INVOKER mantiene le policy RLS della tabella plants.
create or replace function public.aggiungi_nota_pianta(p_plant_id uuid, p_text text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  nota jsonb;
begin
  if p_text is null or length(btrim(p_text)) = 0 or length(p_text) > 10000 then
    raise exception 'La nota deve contenere da 1 a 10000 caratteri.';
  end if;
  nota := jsonb_build_object('id', gen_random_uuid(), 'text', btrim(p_text), 'created_at', now());
  update public.plants set note_entries = note_entries || jsonb_build_array(nota)
    where id = p_plant_id and owner = auth.uid();
  if not found then raise exception 'Pianta non trovata.'; end if;
  return nota;
end;
$$;

create or replace function public.elimina_nota_pianta(p_plant_id uuid, p_note_id text)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if p_note_id = 'legacy' then
    update public.plants set notes = '' where id = p_plant_id and owner = auth.uid();
  else
    update public.plants p set note_entries = (
      select coalesce(jsonb_agg(n.value order by n.ord), '[]'::jsonb)
      from jsonb_array_elements(p.note_entries) with ordinality n(value, ord)
      where n.value->>'id' <> p_note_id
    ) where p.id = p_plant_id and p.owner = auth.uid();
  end if;
  if not found then raise exception 'Pianta non trovata.'; end if;
end;
$$;

revoke all on function public.aggiungi_nota_pianta(uuid, text) from public, anon;
revoke all on function public.elimina_nota_pianta(uuid, text) from public, anon;
grant execute on function public.aggiungi_nota_pianta(uuid, text) to authenticated;
grant execute on function public.elimina_nota_pianta(uuid, text) to authenticated;

commit;

