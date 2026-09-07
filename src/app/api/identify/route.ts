import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getVarietaDiGenere, trovaGenerePerNomeScientifico } from "@/lib/catalogo";
import { ErrorePlantNet, identificaConPlantNet } from "@/lib/plantnet";
import { identificaDallaFoto, riconciliaConCatalogo, type Candidato } from "@/lib/gemini";

export interface CandidatoIdentificazione extends Candidato {
  genusId: string | null;
  varKey: string | null;
}

/**
 * Pipeline a due stadi (SPECIFICA.md §8.2): Pl@ntNet per la specie botanica,
 * poi Gemini per scegliere la varietà fra quelle schedate nel genere
 * corrispondente. Se Pl@ntNet non riconosce nulla, esaurisce la quota, o
 * il genere non è fra i nostri 11, si manda la foto direttamente a Gemini.
 * Sono proposte, non diagnosi: lo dice anche l'interfaccia.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
  }

  const formData = await request.formData();
  const foto = formData.get("foto");
  if (!(foto instanceof Blob)) {
    return NextResponse.json({ error: "Nessuna foto ricevuta." }, { status: 400 });
  }

  let fonte: "plantnet" | "gemini-photo" = "gemini-photo";
  let raw: unknown = null;
  let candidatiGemini: Candidato[] = [];
  let genereTrovato: ReturnType<typeof trovaGenerePerNomeScientifico> = undefined;

  try {
    const risultatiPlantNet = await identificaConPlantNet(foto);
    raw = risultatiPlantNet;

    if (risultatiPlantNet.length > 0) {
      genereTrovato = trovaGenerePerNomeScientifico(risultatiPlantNet[0].genere);
    }

    if (genereTrovato) {
      const varieta = getVarietaDiGenere(genereTrovato.id);
      candidatiGemini = await riconciliaConCatalogo(risultatiPlantNet, varieta);
      fonte = "plantnet";
    }
  } catch (err) {
    // Pl@ntNet non ha riconosciuto nulla, quota esaurita, o errore di rete:
    // si degrada allo stadio 2 da solo. Non è un errore da bloccare l'utente.
    if (!(err instanceof ErrorePlantNet)) {
      console.error("Errore Pl@ntNet:", err);
    }
  }

  // Nessun genere riconosciuto (Pl@ntNet fallito, o genere fuori catalogo):
  // foto direttamente a Gemini, senza vincolo di elenco.
  if (!genereTrovato) {
    try {
      candidatiGemini = await identificaDallaFoto(foto);
      fonte = "gemini-photo";
    } catch (err) {
      console.error("Errore Gemini:", err);
      return NextResponse.json(
        { error: "Non sono riuscito a identificare la pianta. Riprova più tardi." },
        { status: 502 },
      );
    }
  }

  // Ogni candidato costruito dalla riconciliazione (fonte plantnet)
  // corrisponde per costruzione a una varietà del genere trovato: qui si
  // recupera solo la sua chiave. In fallback (gemini-photo) restano nomi
  // liberi, senza collegamento al catalogo.
  const varietaGenere = genereTrovato ? getVarietaDiGenere(genereTrovato.id) : [];
  const candidati: CandidatoIdentificazione[] = candidatiGemini.map((c) => {
    const varietaCorrispondente = varietaGenere.find(
      (v) => v.nome.toLowerCase() === c.nome.toLowerCase() || v.sinonimo?.toLowerCase() === c.nome.toLowerCase(),
    );
    return {
      ...c,
      genusId: genereTrovato?.id ?? null,
      varKey: varietaCorrispondente?.key ?? null,
    };
  });

  await supabase.from("identifications").insert({
    owner: user.id,
    source: fonte,
    raw,
    candidates: candidati,
    chosen: null,
  });

  return NextResponse.json({ fonte, candidati });
}
