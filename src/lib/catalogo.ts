import generiJson from "../../dati/generi.json";
import varietaJson from "../../dati/varieta.json";
import guidaJson from "../../dati/guida.json";
import illustrazioniJson from "../../dati/illustrazioni.json";

/**
 * Carica e indicizza i quattro JSON di `dati/`: dati di sola lettura
 * versionati nel repo (non righe di database — vedi SPECIFICA.md §5).
 * Non riscrivere i testi botanici: sono verificati su fonti reali.
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

export const generi: Genere[] = generiJson as Genere[];
export const varieta: Varieta[] = varietaJson as Varieta[];
export const guida: BloccoGuida[] = guidaJson as BloccoGuida[];
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
