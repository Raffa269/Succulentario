-- Serve per l'importazione del backup dell'artifact (SPECIFICA.md §7):
-- l'id originale della voce nel backup, per poter "unire ai dati attuali"
-- senza duplicare a ogni reimport. NULL per le piante create nell'app: in
-- Postgres i NULL non confliggono mai fra loro in uno unique index, quindi
-- l'indice non limita le piante organiche.
alter table plants add column import_id text;
create unique index plants_owner_import_id_idx on plants (owner, import_id);
