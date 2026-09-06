# Dati del catalogo

Estratti dall'artifact Succulentario il 5 settembre 2026. Dati di sola lettura:
vanno versionati nel repo, non caricati in database.

| file | contenuto |
|---|---|
| `generi.json` | 11 generi: nome, famiglia, specie rappresentativa, conteggio reale delle specie, paragrafo sul ricovero invernale, introduzione, tabella delle esigenze |
| `varieta.json` | 525 varietà: chiave stabile, genere, nome, sinonimo, descrizione, ricovero, nota di coltivazione |
| `guida.json` | 28 blocchi della guida generale alle succulente |
| `illustrazioni.json` | 11 SVG in linea, uno per genere, viewBox "0 0 120 92" |

Il campo `ricovero` ha quattro valori: `fuori`, `riparo`, `casa`, `casa!`.
Distribuzione: 39 / 256 / 199 / 31.

La chiave `key` è `<genere>#<slug del nome>` e non va cambiata: è ciò che permette
ai backup vecchi di riagganciarsi alle schede. Vedi il capitolo 5 di SPECIFICA.md.

Tutti i testi botanici sono verificati su fonti reali (NYBG, estensioni universitarie
americane, Kew POWO, RHS, Cole & Cole per i Lithops, Desert-Tropicals e altre, elencate
in fondo all'artifact). Dove il dato non esisteva, il testo lo dice esplicitamente.
Non riscriverli a memoria.
