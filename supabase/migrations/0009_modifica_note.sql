begin;

-- Mantiene ID e data originale e aggiorna solo la nota richiesta, sotto RLS.
create or replace function public.modifica_nota_pianta(p_plant_id uuid, p_note_id text, p_text text)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if p_text is null or length(btrim(p_text)) = 0 or length(p_text) > 10000 then
    raise exception 'La nota deve contenere da 1 a 10000 caratteri.';
  end if;
  if p_note_id = 'legacy' then
    update public.plants set notes = btrim(p_text)
      where id = p_plant_id and owner = auth.uid() and notes <> '';
  else
    update public.plants p set note_entries = (
      select jsonb_agg(
        case when n.value->>'id' = p_note_id
          then n.value || jsonb_build_object('text', btrim(p_text), 'updated_at', now())
          else n.value end order by n.ord
      ) from jsonb_array_elements(p.note_entries) with ordinality n(value, ord)
    ) where p.id = p_plant_id and p.owner = auth.uid()
      and exists (select 1 from jsonb_array_elements(p.note_entries) n where n->>'id' = p_note_id);
  end if;
  if not found then raise exception 'Nota non trovata.'; end if;
end;
$$;

revoke all on function public.modifica_nota_pianta(uuid, text, text) from public, anon;
grant execute on function public.modifica_nota_pianta(uuid, text, text) to authenticated;

commit;

