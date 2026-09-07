/**
 * Stadio 1 dell'identificazione (SPECIFICA.md §8.2): specie botanica dalla
 * foto via Pl@ntNet. Piano gratuito, 500 identificazioni/giorno, uso non
 * commerciale — esattamente questo caso.
 */

export interface RisultatoPlantNet {
  score: number;
  nomeScientifico: string;
  genere: string;
  famiglia: string;
  nomiComuni: string[];
}

function comeStringa(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "scientificNameWithoutAuthor" in v) {
    return String((v as { scientificNameWithoutAuthor?: unknown }).scientificNameWithoutAuthor ?? "");
  }
  return "";
}

export class ErrorePlantNet extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export async function identificaConPlantNet(immagine: Blob): Promise<RisultatoPlantNet[]> {
  const apiKey = process.env.PLANTNET_API_KEY;
  if (!apiKey) throw new Error("PLANTNET_API_KEY non configurata.");

  const formData = new FormData();
  formData.append("images", immagine, "foto.jpg");
  formData.append("organs", "auto");

  const res = await fetch(`https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    // 404: nessun risultato. 429: quota esaurita. Entrambi degradano allo
    // stadio 2 (vedi app/api/identify/route.ts), non sono un errore fatale.
    throw new ErrorePlantNet(`Pl@ntNet ha risposto con errore ${res.status}`, res.status);
  }

  const dati = (await res.json()) as { results?: Record<string, unknown>[] };
  const risultati = dati.results ?? [];

  return risultati.map((r) => {
    const specie = (r.species ?? {}) as Record<string, unknown>;
    return {
      score: typeof r.score === "number" ? r.score : 0,
      nomeScientifico: comeStringa(specie.scientificNameWithoutAuthor),
      genere: comeStringa(specie.genus),
      famiglia: comeStringa(specie.family),
      nomiComuni: Array.isArray(specie.commonNames) ? (specie.commonNames as string[]) : [],
    };
  });
}
