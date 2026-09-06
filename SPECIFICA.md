# Succulentario — specifica per la ricostruzione come applicazione web

Documento di riferimento per costruire, con Claude Code, la versione "app vera" del
Succulentario, oggi pubblicato come Claude Artifact.

Data: settembre 2026 · Committente: Raffaele · Lingua dell'interfaccia: italiano

---

## 1. Che cos'è e da dove viene

Il Succulentario è il catalogo personale della collezione di piante grasse di Raffaele.
Esiste già e funziona: è un artifact di ~260 KB, un file HTML unico, con dentro un
catalogo botanico di **11 generi e 525 varietà** scritto a mano su fonti verificate.

Questa non è una riscrittura da zero dei contenuti. **Il catalogo si porta di peso**:
è già estratto in JSON nella cartella `dati/` di questo progetto. Il lavoro da fare è
l'applicazione intorno.

Il motivo del trasloco è uno solo, ed è il vincolo che ha bloccato l'artifact: la
Content Security Policy degli artifact impedisce qualsiasi chiamata a host esterni.
Niente API di identificazione, niente foto reali, niente meteo, niente YouTube vero.
In un'app ospitata da noi quel muro non c'è.

---

## 2. Principi non negoziabili

Sono i vincoli che hanno guidato l'artifact e che devono sopravvivere.

1. **Non si inventa nulla sulle piante.** Ogni indicazione botanica o colturale viene
   da una fonte reale. Dove il dato non esiste, il testo lo dice esplicitamente
   ("Non ho trovato dati specifici…"). Nel catalogo attuale questa regola è già
   applicata riga per riga: non riscrivere né "migliorare" quei testi.
2. **Il terrazzo è il contesto.** Raffaele tiene tutto in terrazzo, dove d'inverno le
   minime notturne scendono a 2-3 °C. Ogni varietà ha per questo un campo `ricovero`
   con quattro valori — è l'informazione più usata di tutta l'app.
3. **I dati non si perdono mai.** L'artifact ha già perso 6 schede una volta, per via
   della pulizia dello storage che Safari fa dopo 7 giorni. La verità sta sul server,
   sempre. Il browser è solo una cache.
4. **Mobile prima di tutto.** L'uso reale è iPhone, in piedi, in terrazzo, con una
   mano. Il desktop è il caso secondario.
5. **Interfaccia in italiano**, testi compresi. Codice e nomi tecnici in inglese.

---

## 3. Stack proposto

Scelto per un'app personale mantenuta da una persona sola con l'aiuto di Claude Code:
poche parti mobili, tutto su piani gratuiti.

| Cosa | Scelta | Perché |
|---|---|---|
| Framework | **Next.js** (App Router, TypeScript) | Le API route servono a tenere le chiavi lato server; un solo repo per tutto |
| Hosting | **Vercel** (piano Hobby) | Deploy da git, gratis a questo carico, dominio HTTPS incluso |
| Database | **Supabase** (Postgres) | Piano gratuito generoso; dà anche storage e autenticazione, riducendo i servizi da gestire |
| Foto | **Supabase Storage** | Bucket privato, URL firmati |
| Autenticazione | **Supabase Auth**, magic link via email | Utente singolo; niente password da ricordare |
| PWA | manifest + service worker | Installabile sulla home dell'iPhone, apertura a schermo intero, catalogo consultabile offline |

Alternative equivalenti se si preferisce: SvelteKit al posto di Next.js, Cloudflare
Pages + D1 + R2 al posto di Vercel + Supabase. Non cambia la sostanza.

---

## 4. Struttura del repo

```
succulentario/
├─ app/                     # route Next.js
│  ├─ (app)/collezione, wishlist, generi, guida, statistiche
│  └─ api/
│     ├─ identify/          # Pl@ntNet + riconciliazione col catalogo
│     ├─ describe/          # identificazione a parole (solo Claude)
│     ├─ videos/            # YouTube Data API, con cache
│     └─ frost/             # Open-Meteo + calcolo dell'allerta
├─ components/
├─ lib/
│  ├─ catalogo.ts           # carica e indicizza i JSON di dati/
│  ├─ supabase.ts
│  └─ import-backup.ts      # legge il backup dell'artifact
├─ dati/                    # ← i quattro file di questo progetto, invariati
├─ public/  (manifest, icone)
└─ supabase/migrations/
```

---

## 5. I dati statici del catalogo

Quattro file JSON, già pronti in `dati/`. Sono **dati di sola lettura versionati nel
repo**, non righe di database: si aggiornano con un commit, funzionano offline e non
costano query.

### `varieta.json` — 525 oggetti

```json
{
  "key": "sansevieria#dracaena-trifasciata-laurentii",
  "genere": "sansevieria",
  "nome": "Dracaena trifasciata 'Laurentii'",
  "sinonimo": "",
  "descrizione": "bordi gialli continui su entrambi i lati",
  "ricovero": "casa",
  "note": "Come la specie tipo, ma la variegatura gialla chiede più luce…"
}
```

`key` è la chiave stabile usata anche dall'artifact: `<genere>#<slug del nome>`.
**Non cambiarla**: è ciò che permette a un backup vecchio di riagganciarsi alle schede.
Lo slug si ottiene da: minuscolo → NFD → via i segni diacritici → apostrofi, virgolette
e `×` diventano spazi → tutto ciò che non è `[a-z0-9]` diventa `-` → trattini di bordo
rimossi. In caso di collisione si accoda `-2`.

`ricovero` ha esattamente quattro valori, ed è il cuore dell'app:

| valore | significato | colore nell'interfaccia |
|---|---|---|
| `fuori` | resta in terrazzo tutto l'anno | verde |
| `riparo` | basta un riparo freddo ma luminoso e asciutto | blu |
| `casa` | in casa d'inverno | ocra |
| `casa!` | delicata, fra le prime da ritirare | rosso |

Distribuzione attuale: 39 `fuori`, 256 `riparo`, 199 `casa`, 31 `casa!`.
Tutte e 525 hanno una nota di coltivazione non vuota.

### `generi.json` — 11 oggetti

Campi: `id`, `nome`, `fam`, `illu` (chiave dell'illustrazione), `rappr` (specie
rappresentativa), `totale` (quante specie esistono davvero, con la fonte), `inverno`
(il paragrafo sul ricovero invernale, tarato sui 2-3 °C del terrazzo), `keys` (sinonimi
per la ricerca), `intro`, `spec` (coppie `[etichetta, testo]`).

Gli id: `sansevieria`, `echeveria`, `haworthia`, `aloe`, `crassula`, `sedum`,
`kalanchoe`, `curio`, `euphorbia`, `caudici`, `lithops`.

### `guida.json` — 28 blocchi

Guida generale alle succulente. Blocchi tipizzati per chiave: `h`, `lead`, `h2`, `h3`,
`p`, `ul`, `table`, `callout`. Da rendere con un piccolo renderer, non con `dangerouslySetInnerHTML`
libero (le voci `ul` contengono `<b>` intenzionali: consentire solo quelli).

### `illustrazioni.json` — 11 SVG

Disegni schematici in linea, uno per genere, `viewBox="0 0 120 92"`, `stroke="currentColor"`.
Servono come segnaposto quando una pianta non ha foto. Restano utili anche dopo, ma
vedi §8.6 sulle foto reali.

---

## 6. Modello dati (Postgres)

Solo i dati personali stanno in tabella. Il catalogo no.

```sql
create type plant_kind as enum ('collection', 'wishlist', 'lost');

create table plants (
  id           uuid primary key default gen_random_uuid(),
  owner        uuid not null references auth.users(id),
  kind         plant_kind not null default 'collection',
  num          integer,                    -- numero di catalogo, solo per kind='collection'
  name         text not null,
  genus_id     text,                       -- id del genere, es. 'haworthia'
  var_key      text,                       -- chiave della varietà schedata, o null
  photo_path   text,                       -- percorso nel bucket, non un data URL
  purchase_ym  text,                       -- 'AAAA-MM'
  prop_soil    boolean not null default false,
  prop_hum     boolean not null default false,
  notes        text default '',
  added_at     timestamptz not null default now(),
  -- solo per kind='lost'
  lost_ym      text,
  cause        text,
  lesson       text,
  updated_at   timestamptz not null default now()
);

create index on plants (owner, kind);
create index on plants (owner, var_key);

-- log delle identificazioni: serve a non ripagare due volte e a capire cosa funziona
create table identifications (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null references auth.users(id),
  plant_id    uuid references plants(id) on delete set null,
  source      text not null,               -- 'plantnet' | 'claude-text' | 'claude-photo'
  raw         jsonb,                       -- risposta grezza del servizio
  candidates  jsonb,                       -- candidati mostrati, dopo la riconciliazione
  chosen      text,                        -- nome scelto dall'utente, se ha scelto
  created_at  timestamptz not null default now()
);

-- cache dei video: le ricerche YouTube hanno una quota giornaliera bassa
create table video_cache (
  query       text primary key,
  results     jsonb not null,
  fetched_at  timestamptz not null default now()
);

create table settings (
  owner        uuid primary key references auth.users(id),
  lat          double precision,           -- posizione del terrazzo
  lon          double precision,
  frost_at     numeric default 5,          -- soglia di allerta in °C
  push_sub     jsonb                       -- subscription Web Push
);
```

RLS attiva su tutto, con la classica policy `owner = auth.uid()`.

`seq` (il contatore dei numeri di catalogo dell'artifact) non serve come colonna:
`max(num)` sulle piante dell'utente fa lo stesso lavoro.

---

## 7. Migrazione dei dati esistenti

**Questo è il primo pezzo da costruire dopo l'ossatura, prima di ogni funzione nuova.**
Senza, l'app non serve a niente.

L'artifact esporta un backup JSON completo, foto comprese. Formato esatto:

```json
{
  "app": "succulentario",
  "version": 2,
  "exportedAt": "2026-09-05T20:00:00.000Z",
  "seq": 6,
  "collection": [{
    "id": "m0abc12xyz",
    "name": "Dracaena masoniana 'Whale Fin'",
    "genus": "sansevieria",
    "varKey": "sansevieria#dracaena-masoniana-whale-fin",
    "photo": "data:image/jpeg;base64,/9j/4AAQ…",
    "date": "2026-04",
    "propSoil": false,
    "propHum": true,
    "notes": "",
    "num": 3,
    "added": "2026-04-11T09:12:00.000Z"
  }],
  "wishlist": [ /* stessi campi, senza date/propSoil/propHum/num */ ],
  "lost":     [ /* stessi campi, più lostDate, cause, note */ ]
}
```

`photo` è un data URL JPEG (immagine già ridimensionata a 800 px e compressa a
qualità 0,72) oppure `null`.

L'importatore deve:

1. accettare sia il `.json` sia la **pagina `.html`** esportata dall'artifact — in
   quest'ultima i dati stanno in `<script id="succulentario-data" type="application/json">`;
2. decodificare ogni `photo` e caricarla su Supabase Storage, salvando in `photo_path`
   il percorso, mai il data URL;
3. mappare `note` (la lezione imparata sulle piante perse) in `lesson`, e `date`/`lostDate`
   in `purchase_ym`/`lost_ym`;
4. **riagganciare le varietà**: se `varKey` non esiste nel catalogo, cercare il nome
   normalizzato fra i nomi e i sinonimi delle 525 varietà e riassegnare la chiave. È la
   funzione `relink()` dell'artifact e va riportata identica, perché è ciò che rende
   i backup vecchi ancora leggibili;
5. offrire, come l'artifact, sia "sostituisci tutto" sia "unisci ai dati attuali"
   (deduplicando per `id` di origine).

Va mantenuta anche **l'esportazione**, nei due formati attuali (backup JSON e pagina
HTML autonoma con le foto incorporate, pubblicabile su GitHub Pages). È l'assicurazione
di Raffaele e non deve sparire nel trasloco.

---

## 8. Funzionalità

### 8.1 Quelle che esistono e vanno riprodotte

- **Collezione**: griglia di schede con foto, numero di catalogo, nome, genere, mese e
  anno di acquisto, i due flag di propagazione (in terra / per umidità), note.
  Ricerca per nome, varietà, genere e note; ordinamento per catalogo, acquisto più
  recente, nome, genere.
- **Copertura del catalogo**: percentuale di varietà schedate che possiede.
- **Wishlist**: nome e foto, con il pulsante che promuove alla collezione in un clic,
  impostando il mese corrente come acquisto.
- **Schede per genere**: illustrazione o foto della sua pianta di quel genere,
  introduzione, riquadro sul ricovero invernale, tabella delle esigenze, elenco completo
  delle varietà con etichetta di ricovero colorata, nota di coltivazione e i pulsanti
  "Ho questa" / "La voglio".
- **Guida generale**.
- **Statistiche**: piante per genere, copertura per genere, acquisti per anno,
  propagazioni in corso, tasso di sopravvivenza.
- **Cimitero**: piante perse con data, causa, lezione imparata, permanenza media, e la
  possibilità di riportarle in collezione.
- **Foto**: scatto dalla fotocamera o scelta dalla galleria, ridimensionamento a 800 px
  e compressione lato client prima del caricamento (mantenere: fa risparmiare banda in
  terrazzo). Sul server conservare la versione compressa; l'originale è facoltativo.
- **Import/export** come al §7.

### 8.2 Identificazione dalla foto — la funzione che motiva il trasloco

Pipeline a due stadi, perché i due pezzi si coprono i buchi a vicenda:

**Stadio 1 — Pl@ntNet** dà la specie botanica dalla foto.

```
POST https://my-api.plantnet.org/v2/identify/all?api-key=CHIAVE
Content-Type: multipart/form-data
  images: <file jpeg o png>        (fino a 5 per richiesta, 50 MB totali)
  organs: leaf                     (uno per immagine; 'auto' lascia decidere all'AI)
```

Risposta: array di risultati ordinati per `score` (0-1), ciascuno con
`species.scientificNameWithoutAuthor`, `species.genus`, `species.family`,
`species.commonNames`. Il campo `remainingIdentificationRequests` dice quante
identificazioni restano oggi.

Piano gratuito: **500 identificazioni al giorno**, per uso non commerciale — cioè
esattamente questo caso. Chiave da `my.plantnet.org`.

**Stadio 2 — Claude riconcilia col catalogo.** Pl@ntNet è forte sulla specie e debole
sulle cultivar: non distingue una `'Laurentii'` da una `'Black Gold'`. Si passano quindi
all'API Anthropic i primi 3-5 risultati di Pl@ntNet **più** l'elenco delle varietà del
genere corrispondente (con le loro descrizioni morfologiche, che sono già nel catalogo),
chiedendo di scegliere fra quelle e di dire perché. Vincolo di prompt: non può proporre
nomi fuori dall'elenco.

Restituire al massimo 3 candidati, ciascuno con nome, livello di sicurezza
(alta/media/bassa) e una riga di motivazione che citi un dettaglio visibile. Un tocco sul
candidato compila il campo nome e collega la scheda. Sono proposte, non diagnosi, e
l'interfaccia deve dirlo.

Se Pl@ntNet non riconosce nulla o esaurisce la quota, si degrada allo stadio 2 da solo,
mandando la foto direttamente all'API Anthropic (che accetta immagini).

Ogni identificazione va registrata in `identifications`.

### 8.3 Identificazione a parole

Già costruita nell'artifact e da portare: se l'utente non ha una foto utile, descrive a
parole quello che vede (forma, sezione della foglia, superficie, colori, spine,
dimensione, fiori), eventualmente restringendo a un genere, e Claude propone candidati
scelti solo fra le 525 varietà. Il prompt è nel codice dell'artifact e funziona: riusarlo.

### 8.4 Allerta gelo — la funzione più utile che oggi manca

Raffaele tiene tutto in terrazzo. Il catalogo sa già, varietà per varietà, chi deve
rientrare e a che soglia. Manca solo la temperatura.

```
GET https://api.open-meteo.com/v1/forecast
      ?latitude=..&longitude=..
      &daily=temperature_2m_min
      &timezone=auto
      &forecast_days=3
```

Nessuna chiave richiesta per uso non commerciale. Limiti del piano libero: 600 chiamate
al minuto, 10.000 al giorno, 300.000 al mese — enormemente sopra il fabbisogno.

Logica: un controllo giornaliero (cron di Vercel, la sera) confronta la minima prevista
con le soglie e produce un avviso che nomina **le piante specifiche**, non un allarme
generico:

> Domani notte 1 °C. Rientrano stanotte: le 4 delicate (Adenium obesum, Gasteria
> glomerata…) e le 11 da casa. Le 6 taggate "riparo" bastano sotto la tettoia,
> purché asciutte.

Notifica via **Web Push**. Su iPhone funziona da iOS 16.4 **solo se l'app è stata
aggiunta alla schermata Home** — quindi l'onboarding deve spiegarlo. Apple aveva
annunciato di voler togliere le web app dalla home in UE con iOS 17.4 e poi ha fatto
marcia indietro nel marzo 2024: in Italia funziona. Prevedere comunque un fallback via
email, che non dipende da Apple.

Serve un campo impostazioni con la posizione del terrazzo e la soglia (default 5 °C:
sopra lo zero, perché il pericolo vero arriva prima del gelo).

### 8.5 Video YouTube veri

Requisito originale mai soddisfatto: oggi l'artifact apre solo una ricerca. Con la
YouTube Data API v3, `search.list` restituisce i video veri.

Attenzione alla quota: la quota giornaliera predefinita è di 10.000 unità, ma
`search.list` ha un tetto suo di **100 chiamate al giorno**. Con 525 varietà questo
significa che i risultati **vanno messi in cache in tabella** (`video_cache`) e
richiesti solo su richiesta esplicita, mai in blocco: i video di cura di una specie non
cambiano di settimana in settimana. Una scadenza cache di 90 giorni è abbondante.

### 8.6 Foto reali delle varietà

Fuori dall'artifact si possono mostrare immagini esterne, ma con giudizio: le foto sul
web hanno una licenza. Le fonti utilizzabili sono quelle con licenza esplicita —
Wikimedia Commons (API `commons.wikimedia.org/w/api.php`, con attribuzione obbligatoria)
e le foto di GBIF/iNaturalist con licenza CC. **Mostrare sempre autore e licenza sotto
l'immagine.** Le illustrazioni SVG restano come segnaposto e come stile della casa.

### 8.7 Altre cose che il trasloco rende possibili, in ordine di utilità

- **Promemoria di annaffiatura per gruppo stagionale**, calcolati sul calendario che è
  già scritto nelle schede (i Lithops all'asciutto da novembre ad aprile, le Crassula
  sudafricane a riposo in piena estate, la Kalanchoe blossfeldiana che vuole notti
  lunghe e buie da ottobre). L'app conosce già queste regole: manca solo il calendario
  che le fa scattare.
- **Diario per pianta**: rinvasi, fioriture, trattamenti, con foto datate. La
  progressione fotografica di una pianta nel tempo è la cosa che le app commerciali
  fanno e che qui manca.
- **Apify**, se mai servisse: non per identificare le piante (vedi §9), ma per
  monitorare disponibilità e prezzi delle varietà in wishlist sui vivai online.
  Da valutare solo dopo che tutto il resto funziona.

---

## 9. Servizi esterni: cosa usare e cosa no

| Servizio | A cosa serve | Costo | Chiave |
|---|---|---|---|
| **Pl@ntNet** | specie botanica dalla foto | 500/giorno gratis, uso non commerciale | sì |
| **API Anthropic** | riconciliazione col catalogo, identificazione a parole | a consumo, pochi centesimi al mese a questi volumi | sì |
| **Open-Meteo** | minime previste sul terrazzo | gratis, uso non commerciale | no |
| **YouTube Data API v3** | i 5 video per specie | gratis entro quota (100 ricerche/giorno) | sì |
| **Wikimedia Commons** | foto delle varietà, con attribuzione | gratis | no |

**Da non usare: Apify o altri scraper di Google Lens per l'identificazione.** Gli attori
esistono, ma diversi sono già marcati come deprecati: sono scraper di un servizio che non
vuole essere scrapato, si rompono a ogni cambio di markup, consumano crediti e stanno in
una zona grigia dei termini d'uso. Per la stessa cosa Pl@ntNet costa zero, ha un contratto
pubblico e non si rompe.

Tutte le chiavi stanno **solo** nelle variabili d'ambiente del server e si usano solo
dentro le API route. Nessuna chiave nel bundle del client, mai.

---

## 10. Interfaccia

Il design attuale è già tarato su mobile e verificato per contrasto: **riprodurlo, non
reinventarlo**. Va copiato dal `<style>` dell'artifact, che contiene la palette completa
con le varianti chiara e scura.

Impianto: tre colori portanti più il rosso di allarme, che non sono decorazione ma
codificano il ricovero — verde `#2F6045` fuori tutto l'anno, blu `#2A5878` riparo freddo,
ocra `#7E5A1F` in casa d'inverno, rosso `#8F3527` delicata. Fondo `#F1F2EC`, superfici
`#FBFBF7`, testo `#141811`, testo secondario `#555D4F`. Ogni colore di testo è già
verificato sopra 4,5:1 sul proprio fondo: se si cambia una tinta, riverificare.

Caratteri: Newsreader per i titoli, Karla per il testo, IBM Plex Mono per etichette e
numeri.

Regole mobile che vanno mantenute: campi di input a 16 px (sotto quella misura iOS
zooma da solo), aree toccabili di almeno 40 px, righe delle varietà che diventano
blocchi sotto i 760 px, due colonne di foto sotto i 520 px.

---

## 11. Ordine di costruzione

1. **Ossatura**: Next.js + Supabase + autenticazione + PWA installabile. Deploy su
   Vercel funzionante prima di scrivere qualsiasi funzione.
2. **Catalogo in sola lettura**: caricamento dei quattro JSON, schede per genere, elenco
   varietà, guida, ricerca. Nessun dato personale ancora. A questo punto l'app è già
   consultabile in terrazzo.
3. **Collezione, wishlist, cimitero** con foto su Storage, e **subito l'importazione del
   backup** dell'artifact: da qui in poi i dati veri sono nell'app nuova.
4. **Esportazione** nei due formati. Solo adesso si può abbandonare l'artifact.
5. **Identificazione**: prima quella a parole (nessuna chiave esterna), poi Pl@ntNet.
6. **Allerta gelo**: prima la schermata che mostra le previsioni e chi va rientrato,
   poi le notifiche push.
7. **Video YouTube** con cache.
8. Il resto di §8.7, se e quando serve.

Ogni tappa deve essere in produzione e usabile prima di cominciare la successiva.

---

## 12. Cose da non fare

- Non riscrivere i testi botanici: sono verificati riga per riga sulle fonti elencate
  in fondo all'artifact (NYBG, estensioni universitarie americane, Kew POWO, RHS,
  Cole & Cole per i Lithops, e le altre). Se una nota va cambiata, va cambiata su una
  fonte, non a memoria di un modello.
- Non mettere le 525 varietà in tabella: sono dati di repo.
- Non salvare le foto come data URL nel database: era una scelta obbligata
  dell'artifact, non un modello da imitare.
- Non cambiare il formato delle chiavi `var_key`: rompe la compatibilità con i backup.
- Non far dipendere da una chiave API funzioni che devono restare consultabili offline
  in terrazzo (schede, guida, elenco varietà).
- Non introdurre un secondo posto dove i dati "vivono": la verità è Postgres, il
  browser è cache.

---

## Fonti verificate per questa specifica

- Pl@ntNet, documentazione API e prezzi — https://my.plantnet.org/doc/api/identify · https://my.plantnet.org/pricing
- Kindwise (plant.id), prezzi — https://www.kindwise.com/pricing
- Open-Meteo, documentazione e piani — https://open-meteo.com/en/docs · https://open-meteo.com/en/pricing
- YouTube Data API v3, costi di quota — https://developers.google.com/youtube/v3/determine_quota_cost
- Web Push su iOS e requisito della schermata Home — https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide
- Marcia indietro di Apple sulle web app in UE (marzo 2024) — https://9to5mac.com/2024/03/01/apple-home-screen-web-apps-ios-17-eu/
- Attori Google Lens su Apify, diversi già deprecati — https://apify.com/newyear/google-reverse-image-search/api
