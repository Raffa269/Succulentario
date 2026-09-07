-- "Automatically expose new tables" era disattivato alla creazione del
-- progetto (di proposito, per controllare l'accesso a mano — vedi
-- SPECIFICA.md §9). Questo lascia il ruolo authenticated senza i permessi
-- di base su una tabella nuova: le policy RLS filtrano le RIGHE, ma prima
-- serve il permesso sulla TABELLA, altrimenti Postgres risponde
-- "permission denied for table plants" ancora prima di valutare le policy.
grant select, insert, update, delete on table plants to authenticated;
grant usage on schema public to authenticated;
