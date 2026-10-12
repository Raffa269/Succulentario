export interface RisultatoGoogleVision {
  descrizione: string;
  score: number;
}

interface RispostaVision {
  responses?: {
    webDetection?: {
      webEntities?: { description?: string; score?: number }[];
      bestGuessLabels?: { label?: string }[];
      pagesWithMatchingImages?: { pageTitle?: string; url?: string }[];
      visuallySimilarImages?: { url?: string }[];
    };
    error?: { message?: string };
  }[];
}

function pulisci(testo: string) {
  return testo
    .replace(/\s+/g, " ")
    .replace(/\|.*$/g, "")
    .trim();
}

function aggiungi(
  mappa: Map<string, RisultatoGoogleVision>,
  descrizione: string | undefined,
  score: number,
) {
  const testo = pulisci(descrizione ?? "");
  if (testo.length < 3) return;
  const key = testo.toLowerCase();
  const precedente = mappa.get(key);
  if (!precedente || precedente.score < score) {
    mappa.set(key, { descrizione: testo, score });
  }
}

/**
 * Google Cloud Vision Web Detection: non è Google Lens, ma porta dentro
 * entità e nomi trovati sul web da immagini simili. È un segnale aggiuntivo:
 * se la chiave non è configurata o Google risponde male, la pipeline continua.
 */
export async function identificaConGoogleVisionWeb(immagine: Blob): Promise<RisultatoGoogleVision[]> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  if (!apiKey) return [];

  const buffer = await immagine.arrayBuffer();
  const content = Buffer.from(buffer).toString("base64");

  const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          image: { content },
          features: [{ type: "WEB_DETECTION", maxResults: 10 }],
        },
      ],
    }),
  });

  if (!res.ok) {
    const corpo = await res.text();
    throw new Error(`Google Vision ha risposto con errore ${res.status}: ${corpo.slice(0, 300)}`);
  }

  const dati = (await res.json()) as RispostaVision;
  const risposta = dati.responses?.[0];
  if (risposta?.error?.message) throw new Error(risposta.error.message);

  const web = risposta?.webDetection;
  if (!web) return [];

  const risultati = new Map<string, RisultatoGoogleVision>();

  for (const entity of web.webEntities ?? []) {
    aggiungi(risultati, entity.description, entity.score ?? 0.5);
  }
  for (const label of web.bestGuessLabels ?? []) {
    aggiungi(risultati, label.label, 0.8);
  }
  for (const pagina of web.pagesWithMatchingImages ?? []) {
    aggiungi(risultati, pagina.pageTitle, 0.35);
  }

  return [...risultati.values()]
    .filter((r) => !/succulent|plant|flower|cactus|image|photo|stock/i.test(r.descrizione) || r.descrizione.split(" ").length > 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}
