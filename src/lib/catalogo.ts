import generiJson from "../../dati/generi.json";
import varietaJson from "../../dati/varieta.json";
import guidaJson from "../../dati/guida.json";
import illustrazioniJson from "../../dati/illustrazioni.json";
import calendarioJson from "../../dati/calendario.json";

/**
 * Carica e indicizza i JSON di `dati/`: dati di sola lettura versionati nel
 * repo (non righe di database — vedi SPECIFICA.md §5). Non riscrivere i
 * testi botanici di generi/varieta/guida: sono verificati su fonti reali.
 * `calendario.json` fa eccezione: è una bozza scritta da Claude (settembre
 * 2026, su richiesta esplicita di Raffaele) non ancora verificata riga per
 * riga — segnalarlo se viene toccato, non trattarlo come i testi già
 * verificati.
 */

export type Ricovero = "fuori" | "riparo" | "casa" | "casa!";

export interface Varieta {
  key: string;
  genere: string;
  nome: string;
  sinonimo: string;
  descrizione: string;
  ricovero: Ricovero;
  note: string;
}

export type SpecCoppia = [etichetta: string, testo: string];

export interface Genere {
  id: string;
  nome: string;
  fam: string;
  illu: string;
  rappr: string;
  totale: string;
  inverno: string;
  keys: string[];
  intro: string;
  spec: SpecCoppia[];
}

export type BloccoGuida =
  | { h: string }
  | { lead: string }
  | { h2: string }
  | { h3: string }
  | { p: string }
  | { ul: string[] }
  | { table: { head: string[]; rows: string[][] } }
  | { callout: { t: string; x: string } };

export type Illustrazioni = Record<string, string>;

export interface VoceCalendario {
  genere: string;
  azione: string;
  dettaglio: string;
}

interface MeseCalendario {
  mese: number;
  voci: VoceCalendario[];
}

export const generi: Genere[] = generiJson as Genere[];
export const varieta: Varieta[] = varietaJson as Varieta[];
export const guida: BloccoGuida[] = guidaJson as BloccoGuida[];
export const calendario: MeseCalendario[] = calendarioJson as MeseCalendario[];
export const illustrazioni: Illustrazioni = illustrazioniJson as Illustrazioni;

const ORDINE_RICOVERO: Ricovero[] = ["fuori", "riparo", "casa", "casa!"];

const genereById = new Map(generi.map((g) => [g.id, g]));
const varietaByGenere = new Map<string, Varieta[]>();
for (const v of varieta) {
  const elenco = varietaByGenere.get(v.genere) ?? [];
  elenco.push(v);
  varietaByGenere.set(v.genere, elenco);
}
for (const elenco of varietaByGenere.values()) {
  elenco.sort((a, b) => a.nome.localeCompare(b.nome, "it"));
}

export function getGenere(id: string): Genere | undefined {
  return genereById.get(id);
}

export function getVarietaDiGenere(genereId: string): Varieta[] {
  return varietaByGenere.get(genereId) ?? [];
}

export function getVarietaByKey(key: string): Varieta | undefined {
  return varieta.find((v) => v.key === key);
}

/**
 * Abbina il genere restituito da un servizio esterno (es. Pl@ntNet, che dà
 * solo il nome scientifico) a uno degli 11 generi del catalogo, cercando
 * fra il nome e i sinonimi in `keys` (SPECIFICA.md §8.2).
 */
export function trovaGenerePerNomeScientifico(nome: string): Genere | undefined {
  const norm = normalizza(nome);
  if (!norm) return undefined;
  return generi.find(
    (g) => normalizza(g.nome).includes(norm) || g.keys.some((k) => normalizza(k) === norm),
  );
}

/** Conteggio di controllo: 11 generi, 525 varietà, 39/256/199/31 per ricovero. */
export function contaCatalogo() {
  const perRicovero: Record<Ricovero, number> = { fuori: 0, riparo: 0, casa: 0, "casa!": 0 };
  for (const v of varieta) perRicovero[v.ricovero]++;
  return {
    totaleGeneri: generi.length,
    totaleVarieta: varieta.length,
    perRicovero,
  };
}

export function ordineRicovero(r: Ricovero): number {
  return ORDINE_RICOVERO.indexOf(r);
}

/** Le voci del calendario stagionale per un mese (1 = gennaio, 12 = dicembre). Vedi il commento su `calendario.json` in cima al file. */
export function voceCalendarioDelMese(mese: number): VoceCalendario[] {
  return calendario.find((m) => m.mese === mese)?.voci ?? [];
}

/**
 * Copertura del catalogo: quante varietà distinte (tra quelle passate,
 * es. i `var_key` della collezione) sono possedute, in totale e per
 * ricovero. Usato dalla card "In collezione" della home (mockup 1a).
 */
export function copertura(varKeys: (string | null | undefined)[]) {
  const perRicovero: Record<Ricovero, number> = { fuori: 0, riparo: 0, casa: 0, "casa!": 0 };
  const distinte = new Set(varKeys.filter((k): k is string => !!k));
  for (const key of distinte) {
    const v = getVarietaByKey(key);
    if (v) perRicovero[v.ricovero]++;
  }
  return { totale: distinte.size, perRicovero };
}

// Dopo NFD un carattere accentato si scompone in lettera base + segno
// diacritico separato (categoria Unicode "Mark, nonspacing"): rimuoverlo
// permette di confrontare "e" ed "è" nella ricerca, stesso approccio dello
// slug descritto in SPECIFICA.md §5.
export function normalizza(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "");
}

/**
 * "Relink" dell'importazione backup (SPECIFICA.md §7): se `varKey` non
 * esiste più nel catalogo, cerca il nome normalizzato fra nomi e sinonimi
 * delle 525 varietà e riassegna la chiave. Va tenuta identica a quella
 * dell'artifact: è ciò che permette a un backup vecchio di riagganciarsi.
 */
export function relinkVarKey(varKeyOriginale: string | undefined, nome: string): string | null {
  if (varKeyOriginale && getVarietaByKey(varKeyOriginale)) return varKeyOriginale;

  const nomeNorm = normalizza(nome);
  const trovata = varieta.find(
    (v) => normalizza(v.nome) === nomeNorm || (v.sinonimo && normalizza(v.sinonimo) === nomeNorm),
  );
  return trovata ? trovata.key : null;
}

export interface RisultatoRicerca {
  tipo: "genere" | "varieta";
  titolo: string;
  sottotitolo: string;
  href: string;
}

/**
 * Varietà il cui nome (o sinonimo) contiene la query: usata dal
 * completamento automatico del modulo "nuova pianta" (mockup 1c).
 */
export function cercaVarietaPerNome(query: string, limite = 6): Varieta[] {
  const q = normalizza(query.trim());
  if (q.length < 2) return [];
  const risultati: Varieta[] = [];
  for (const v of varieta) {
    if (normalizza(v.nome).includes(q) || (v.sinonimo && normalizza(v.sinonimo).includes(q))) {
      risultati.push(v);
      if (risultati.length >= limite) break;
    }
  }
  return risultati;
}

/** Ricerca semplice per sottostringa, usata dalla pagina /cerca. */
export function cerca(query: string): RisultatoRicerca[] {
  const q = normalizza(query.trim());
  if (q.length < 2) return [];

  const risultati: RisultatoRicerca[] = [];

  for (const g of generi) {
    const combacia = normalizza(g.nome).includes(q) || g.keys.some((k) => normalizza(k).includes(q));
    if (combacia) {
      risultati.push({ tipo: "genere", titolo: g.nome, sottotitolo: g.fam, href: `/generi/${g.id}` });
    }
  }

  for (const v of varieta) {
    const combacia =
      normalizza(v.nome).includes(q) ||
      (v.sinonimo && normalizza(v.sinonimo).includes(q)) ||
      normalizza(v.descrizione).includes(q) ||
      normalizza(v.note).includes(q);
    if (combacia) {
      const slug = v.key.split("#")[1] ?? v.key;
      const nomeGenere = getGenere(v.genere)?.nome ?? v.genere;
      risultati.push({
        tipo: "varieta",
        titolo: v.nome,
        sottotitolo: nomeGenere,
        href: `/generi/${v.genere}#${slug}`,
      });
    }
  }

  return risultati;
}
