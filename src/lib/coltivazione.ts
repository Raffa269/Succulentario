import { getGenere, getVarietaByKey, normalizza, type Varieta } from "@/lib/catalogo";
import { indicazioneIndoorPerScheda, type IndicazioneIndoor } from "@/lib/indoor";
import type { Plant } from "@/lib/plants";

export type Esposizione = "sole pieno" | "mezzo sole" | "mezz'ombra";
export type Terriccio = "normale" | "più drenante" | "meno drenante";

export interface IndicazioniColtivazione {
  esposizione: Esposizione;
  terriccio: Terriccio;
  indoor: IndicazioneIndoor;
}

const ESPOSIZIONE_PER_GENERE: Record<string, Esposizione> = {
  aloe: "mezzo sole",
  caudici: "sole pieno",
  crassula: "mezzo sole",
  curio: "mezzo sole",
  echeveria: "sole pieno",
  euphorbia: "mezzo sole",
  haworthia: "mezz'ombra",
  kalanchoe: "mezzo sole",
  lithops: "mezzo sole",
  sansevieria: "mezzo sole",
  sedum: "sole pieno",
};

const TERRICCIO_PER_GENERE: Record<string, Terriccio> = {
  aloe: "più drenante",
  caudici: "più drenante",
  crassula: "normale",
  curio: "più drenante",
  echeveria: "più drenante",
  euphorbia: "più drenante",
  haworthia: "più drenante",
  kalanchoe: "normale",
  lithops: "più drenante",
  sansevieria: "più drenante",
  sedum: "più drenante",
};

function esposizioneDaNota(varieta: Varieta): Esposizione | undefined {
  const nota = normalizza(`${varieta.descrizione} ${varieta.note}`);
  if (
    nota.includes("mezz'ombra") ||
    nota.includes("mezzombra") ||
    nota.includes("ombra luminosa")
  ) {
    return "mezz'ombra";
  }
  if (
    nota.includes("luce brillante ma indiretta") ||
    nota.includes("luce indiretta") ||
    nota.includes("luce filtrata") ||
    nota.includes("sole filtrato") ||
    nota.includes("sole solo del mattino") ||
    nota.includes("sole del mattino") ||
    nota.includes("sole diretto scotta") ||
    nota.includes("niente sole di mezzogiorno")
  ) {
    return "mezzo sole";
  }
  if (
    nota.includes("sole pieno") ||
    nota.includes("molto sole") ||
    nota.includes("luce diretta") ||
    nota.includes("luce forte")
  ) {
    return "sole pieno";
  }
  return undefined;
}

function terriccioDaNota(varieta: Varieta): Terriccio | undefined {
  const nota = normalizza(varieta.note);
  if (
    nota.includes("quasi solo minerale") ||
    nota.includes("prevalentemente minerale") ||
    nota.includes("substrato molto drenante") ||
    nota.includes("substrato quasi") ||
    nota.includes("50-70% di inerti") ||
    nota.includes("sabbia grossa") ||
    nota.includes("pomice") ||
    nota.includes("perlite")
  ) {
    return "più drenante";
  }
  if (
    nota.includes("un po' piu organico") ||
    nota.includes("substrato piu organico") ||
    nota.includes("meno minerale")
  ) {
    return "meno drenante";
  }
  return undefined;
}

export function indicazioniPerPianta(pianta: Plant): IndicazioniColtivazione {
  const varieta = pianta.var_key ? getVarietaByKey(pianta.var_key) : undefined;
  const genereId = varieta?.genere ?? pianta.genus_id ?? "";
  const genere = genereId ? getGenere(genereId) : undefined;

  return {
    esposizione:
      (varieta ? esposizioneDaNota(varieta) : undefined) ??
      ESPOSIZIONE_PER_GENERE[genere?.id ?? genereId] ??
      "mezzo sole",
    terriccio:
      (varieta ? terriccioDaNota(varieta) : undefined) ??
      TERRICCIO_PER_GENERE[genere?.id ?? genereId] ??
      "normale",
    indoor: indicazioneIndoorPerScheda(pianta.var_key, genere?.id ?? genereId),
  };
}
