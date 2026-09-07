import { relinkVarKey } from "@/lib/catalogo";
import type { PlantKind } from "@/lib/plants";

/**
 * Legge un backup, in uno dei due formati: quello dell'artifact originale
 * (SPECIFICA.md §7, collection/wishlist/lost separati) o quello nativo
 * dell'app (app/actions/export.ts, un solo elenco `plants`). Entrambi
 * possono arrivare come .json puro o come pagina .html autonoma, con i
 * dati in `<script id="succulentario-data" type="application/json">`.
 */
function estraiDatiGrezzi(testo: string): unknown {
  const t = testo.trim();
  if (t.startsWith("{")) {
    return JSON.parse(t);
  }
  const match = /<script[^>]*id=["']succulentario-data["'][^>]*>([\s\S]*?)<\/script>/i.exec(testo);
  if (!match) {
    throw new Error("Non trovo i dati del backup in questo file: manca lo script succulentario-data.");
  }
  return JSON.parse(match[1]);
}

export interface VoceDaImportare {
  importId: string;
  kind: PlantKind;
  name: string;
  genusId: string | null;
  varKey: string | null;
  varKeyOriginale: string | null;
  relinkFallito: boolean;
  fotoDataUrl: string | null;
  num: number | null;
  purchaseYm: string | null;
  propSoil: boolean;
  propHum: boolean;
  notes: string;
  addedAt: string | null;
  lostYm: string | null;
  cause: string | null;
  lesson: string;
}

function testo(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/** Formato storico dell'artifact: collection/wishlist/lost separati, nomi di campo diversi dai nostri. */
function analizzaVoceArtifact(v: Record<string, unknown>, kind: PlantKind): VoceDaImportare {
  const nome = testo(v.name) || "Senza nome";
  const varKeyOriginale = testo(v.varKey) || null;
  const varKey = relinkVarKey(varKeyOriginale ?? undefined, nome);

  return {
    importId: testo(v.id) || crypto.randomUUID(),
    kind,
    name: nome,
    genusId: testo(v.genus) || (varKey ? varKey.split("#")[0] : null),
    varKey,
    varKeyOriginale,
    relinkFallito: Boolean(varKeyOriginale) && !varKey,
    fotoDataUrl: typeof v.photo === "string" ? v.photo : null,
    num: typeof v.num === "number" ? v.num : null,
    purchaseYm: testo(v.date) || null,
    propSoil: Boolean(v.propSoil),
    propHum: Boolean(v.propHum),
    notes: testo(v.notes),
    addedAt: testo(v.added) || null,
    lostYm: testo(v.lostDate) || null,
    cause: testo(v.cause) || null,
    lesson: testo(v.note),
  };
}

/** Formato proprio dell'app (vedi app/actions/export.ts): un solo elenco `plants`, nomi di campo identici ai nostri. */
function analizzaVoceApp(v: Record<string, unknown>): VoceDaImportare {
  const nome = testo(v.name) || "Senza nome";
  const varKeyOriginale = testo(v.varKey) || null;
  const varKey = relinkVarKey(varKeyOriginale ?? undefined, nome);
  const kind = (testo(v.kind) as PlantKind) || "collection";

  return {
    importId: testo(v.id) || crypto.randomUUID(),
    kind,
    name: nome,
    genusId: testo(v.genusId) || (varKey ? varKey.split("#")[0] : null),
    varKey,
    varKeyOriginale,
    relinkFallito: Boolean(varKeyOriginale) && !varKey,
    fotoDataUrl: typeof v.photoDataUrl === "string" ? v.photoDataUrl : null,
    num: typeof v.num === "number" ? v.num : null,
    purchaseYm: testo(v.purchaseYm) || null,
    propSoil: Boolean(v.propSoil),
    propHum: Boolean(v.propHum),
    notes: testo(v.notes),
    addedAt: testo(v.addedAt) || null,
    lostYm: testo(v.lostYm) || null,
    cause: testo(v.cause) || null,
    lesson: testo(v.lesson),
  };
}

export interface BackupAnalizzato {
  exportedAt: string | null;
  voci: VoceDaImportare[];
}

export function analizzaBackup(testoFile: string): BackupAnalizzato {
  const dati = estraiDatiGrezzi(testoFile);
  if (!dati || typeof dati !== "object" || (dati as Record<string, unknown>).app !== "succulentario") {
    throw new Error("Questo file non sembra un backup del Succulentario.");
  }

  const d = dati as Record<string, unknown>;

  if (d.formatVersion === "app-v1") {
    const elenco = (Array.isArray(d.plants) ? d.plants : []) as Record<string, unknown>[];
    return {
      exportedAt: testo(d.exportedAt) || null,
      voci: elenco.map(analizzaVoceApp),
    };
  }

  const collezione = (Array.isArray(d.collection) ? d.collection : []) as Record<string, unknown>[];
  const wishlist = (Array.isArray(d.wishlist) ? d.wishlist : []) as Record<string, unknown>[];
  const persi = (Array.isArray(d.lost) ? d.lost : []) as Record<string, unknown>[];

  return {
    exportedAt: testo(d.exportedAt) || null,
    voci: [
      ...collezione.map((v) => analizzaVoceArtifact(v, "collection")),
      ...wishlist.map((v) => analizzaVoceArtifact(v, "wishlist")),
      ...persi.map((v) => analizzaVoceArtifact(v, "lost")),
    ],
  };
}
