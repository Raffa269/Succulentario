# Poster collezione (sperimentale)

Disattivazione immediata: impostare `POSTER_COLLEZIONE_ABILITATO = false` in
`config.ts`. L'icona sparisce, la pagina restituisce 404 e l'azione rifiuta il download.

Rimozione completa: rimuovere import e utilizzo di `LinkPosterCollezione` da
`src/components/app-header.tsx`, quindi eliminare questa cartella,
`src/app/(app)/poster-collezione` e `public/poster-collezione`.
Nessuna migrazione, dipendenza o modifica al backup standard.

La verifica lato server conta esclusivamente `plants.kind = collection` del
proprietario autenticato. Il pacchetto usa il backup standard (comprende anche
wishlist e piante perse per il racconto della collezione). Il ZIP viene composto
nel browser, senza salvare backup personali nel sito o inviarli a ChatGPT.
Contiene esattamente HTML personale, workflow MD e i due PNG di esempio.
