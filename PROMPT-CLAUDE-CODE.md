# Come far partire Claude Code

## Prima di cominciare

Metti questa cartella dove vuoi lavorare e apri lì il terminale:

```bash
mkdir succulentario && cd succulentario
# copia qui dentro SPECIFICA.md, PROMPT-CLAUDE-CODE.md e la cartella dati/
claude
```

Ti servono, prima o durante:

- un account **Vercel** e uno **Supabase** (entrambi gratuiti, si creano in due minuti)
- il **backup del Succulentario attuale**: apri l'artifact, premi *Esporta* → *Backup
  JSON*, e tieni da parte il file. È l'unica copia dei tuoi dati.
- più avanti, quando arrivi allo stadio 5: una chiave **Pl@ntNet** da
  `my.plantnet.org` e una chiave **API Anthropic** da `console.anthropic.com`.

---

## Il prompt di partenza

Incollalo così com'è nella prima conversazione con Claude Code.

---

Devi costruire un'applicazione web che si chiama **Succulentario**: il catalogo
personale della mia collezione di piante grasse.

Non partiamo da zero. In questa cartella trovi:

- `SPECIFICA.md` — leggila per intero prima di scrivere una riga di codice. È il
  documento di riferimento: stack, modello dati, funzionalità, vincoli, ordine di
  costruzione.
- `dati/` — il catalogo botanico già pronto: 11 generi, 525 varietà, la guida generale
  e 11 illustrazioni SVG. Sono dati verificati su fonti reali e **non vanno riscritti,
  riassunti o "migliorati"**: si caricano e basta.

Esiste già una versione funzionante di quest'app come Claude Artifact, cioè un unico
file HTML. La stiamo rifacendo come app vera per un motivo preciso: un artifact non può
contattare host esterni, e quindi non può usare le API di identificazione delle piante,
il meteo o YouTube.

**Come voglio che lavoriamo.**

Costruisci nell'ordine indicato nel capitolo 11 della specifica, e fermati a ogni tappa:
ogni tappa deve essere in produzione su Vercel e usabile dal mio iPhone prima di passare
alla successiva. Preferisco una cosa fatta bene per volta a molti pezzi abbozzati insieme.

Comincia dalla tappa 1: Next.js con TypeScript e App Router, Supabase per database,
storage e autenticazione con magic link, PWA installabile sulla schermata Home
dell'iPhone, deploy su Vercel. Nient'altro. Quando è online e riesco ad accedere, ci
fermiamo e passiamo alla tappa 2.

Prima di partire, se qualcosa della specifica non ti è chiaro almeno al 95%, fammi
delle domande invece di decidere da solo.

---

## Le tappe successive, in breve

Quando una tappa è finita, la successiva si apre con una frase soltanto:

2. *"Tappa 2: carica i quattro JSON di `dati/` e costruisci la parte in sola lettura —
   schede per genere, elenco varietà con le etichette di ricovero colorate, guida
   generale, ricerca. Nessun dato personale ancora."*
3. *"Tappa 3: collezione, wishlist e cimitero con le foto su Storage, e l'importazione
   del backup dell'artifact descritta al capitolo 7. Ecco il mio backup:"* (allega il
   file JSON)
4. *"Tappa 4: l'esportazione nei due formati del capitolo 7."*
5. *"Tappa 5: identificazione — prima quella a parole, poi Pl@ntNet."*
6. *"Tappa 6: allerta gelo."*
7. *"Tappa 7: video YouTube con cache."*

---

## Due avvertenze che valgono più di tutto il resto

**Non abbandonare l'artifact prima della tappa 4.** Finché l'esportazione della nuova
app non funziona, il tuo unico backup affidabile è quello vecchio. Tieni l'artifact vivo
e i dati dentro finché non hai esportato con successo dalla nuova app almeno una volta.

**Fai controllare a Claude Code che le 525 varietà siano tutte arrivate.** Un conteggio
alla fine della tappa 2 — 11 generi, 525 varietà, 39 `fuori`, 256 `riparo`, 199 `casa`,
31 `casa!` — dice in un colpo solo se l'import dei dati è pulito.
