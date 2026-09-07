/**
 * Stadio 2 dell'identificazione (SPECIFICA.md §8.2): riconciliazione col
 * catalogo. Pl@ntNet è forte sulla specie e debole sulle cultivar; qui si
 * passano i suoi risultati migliori più l'elenco delle varietà del genere
 * corrispondente, chiedendo di scegliere solo fra quelle. In alternativa
 * a Claude (indicato in origine dalla specifica): stessa logica, modello
 * diverso, scelto per restare a costo zero.
 */

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

export interface Candidato {
  nome: string;
  confidenza: "alta" | "media" | "bassa";
  motivo: string;
}

const SCHEMA_CANDIDATI = {
  type: "object",
  properties: {
    candidati: {
      type: "array",
      items: {
        type: "object",
        properties: {
          nome: { type: "string" },
          confidenza: { type: "string", enum: ["alta", "media", "bassa"] },
          motivo: { type: "string" },
        },
        required: ["nome", "confidenza", "motivo"],
      },
    },
  },
  required: ["candidati"],
};

interface RispostaGemini {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

async function chiamaGemini(parts: Record<string, unknown>[]): Promise<Candidato[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY non configurata.");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: SCHEMA_CANDIDATI,
      },
    }),
  });

  if (!res.ok) {
    const corpo = await res.text();
    throw new Error(`Gemini ha risposto con errore ${res.status}: ${corpo.slice(0, 300)}`);
  }

  const dati = (await res.json()) as RispostaGemini;
  const testo = dati.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!testo) throw new Error("Risposta di Gemini vuota o inattesa.");

  const parsed = JSON.parse(testo) as { candidati?: Candidato[] };
  return (parsed.candidati ?? []).slice(0, 3);
}

export interface VarietaCandidata {
  nome: string;
  sinonimo: string;
  descrizione: string;
}

/**
 * Riconciliazione vincolata: Gemini sceglie solo fra le varietà passate,
 * non può proporre nomi fuori dall'elenco (SPECIFICA.md §8.2).
 */
export async function riconciliaConCatalogo(
  risultatiPlantNet: { nomeScientifico: string; score: number }[],
  varieta: VarietaCandidata[],
): Promise<Candidato[]> {
  const elencoPlantNet = risultatiPlantNet
    .slice(0, 5)
    .map((r) => `- ${r.nomeScientifico} (punteggio ${Math.round(r.score * 100)}%)`)
    .join("\n");

  const elencoVarieta = varieta
    .map((v) => `- "${v.nome}"${v.sinonimo ? ` (sinonimo: ${v.sinonimo})` : ""}: ${v.descrizione}`)
    .join("\n");

  const prompt = `Un servizio di riconoscimento immagini (Pl@ntNet) ha analizzato la foto di una pianta grassa e propone queste specie, in ordine di probabilità:
${elencoPlantNet}

Il catalogo dell'app contiene queste varietà per il genere corrispondente, ciascuna con una breve descrizione morfologica:
${elencoVarieta}

Scegli al massimo 3 varietà tra quelle elencate sopra (non proporre MAI un nome che non sia esattamente uguale a uno di quelli elencati) che meglio corrispondono al risultato di Pl@ntNet. Per ciascuna indica un livello di confidenza (alta, media o bassa) e una riga di motivazione che citi un dettaglio morfologico specifico dalla descrizione. Se nessuna varietà sembra plausibile, restituisci un elenco vuoto.`;

  return chiamaGemini([{ text: prompt }]);
}

/**
 * Stadio 2 "da solo": Pl@ntNet non ha riconosciuto nulla o ha esaurito la
 * quota, si manda la foto direttamente a Gemini (SPECIFICA.md §8.2). Senza
 * un elenco a cui vincolarsi, i nomi restano proposte libere.
 */
export async function identificaDallaFoto(immagine: Blob): Promise<Candidato[]> {
  const buffer = await immagine.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const prompt = `Questa è la foto di una pianta grassa (succulenta). Pl@ntNet non è riuscito a identificarla o la quota giornaliera è esaurita. Proponi al massimo 3 nomi scientifici plausibili (genere e specie, ed eventuale cultivar se riconoscibile), con un livello di confidenza (alta, media o bassa) e una riga di motivazione basata su ciò che vedi nella foto: forma, colore, spine, superficie. Sii onesto sull'incertezza: se la foto non è sufficiente, dillo nella motivazione e usa confidenza "bassa".`;

  return chiamaGemini([
    { text: prompt },
    { inline_data: { mime_type: immagine.type || "image/jpeg", data: base64 } },
  ]);
}
