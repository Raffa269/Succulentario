import { getGenere, getVarietaByKey, normalizza } from "@/lib/catalogo";

export interface SchedaColtivazioneSuggerita {
  maxHeight: string;
  maxWidth: string;
  darkPeriod: string;
}

const SCONOSCIUTO = "???";

const DIMENSIONI_PER_GENERE: Record<string, Pick<SchedaColtivazioneSuggerita, "maxHeight" | "maxWidth">> = {
  aloe: { maxHeight: SCONOSCIUTO, maxWidth: SCONOSCIUTO },
  caudici: { maxHeight: SCONOSCIUTO, maxWidth: SCONOSCIUTO },
  crassula: { maxHeight: SCONOSCIUTO, maxWidth: SCONOSCIUTO },
  curio: { maxHeight: SCONOSCIUTO, maxWidth: SCONOSCIUTO },
  echeveria: { maxHeight: SCONOSCIUTO, maxWidth: SCONOSCIUTO },
  euphorbia: { maxHeight: SCONOSCIUTO, maxWidth: SCONOSCIUTO },
  haworthia: { maxHeight: SCONOSCIUTO, maxWidth: SCONOSCIUTO },
  kalanchoe: { maxHeight: SCONOSCIUTO, maxWidth: SCONOSCIUTO },
  lithops: { maxHeight: SCONOSCIUTO, maxWidth: SCONOSCIUTO },
  sansevieria: { maxHeight: SCONOSCIUTO, maxWidth: SCONOSCIUTO },
  sedum: { maxHeight: SCONOSCIUTO, maxWidth: SCONOSCIUTO },
};

const BUIO_PER_GENERE: Record<string, string> = {
  lithops: "No buio: riposo asciutto ma luminoso",
};

function dimensioneDaTesto(testo: string, parole: string[]) {
  const testoNorm = normalizza(testo);
  const contieneParola = parole.some((parola) => testoNorm.includes(parola));
  if (!contieneParola) return SCONOSCIUTO;

  const match = testo.match(/(?:fino a|oltre|raramente oltre|alta? fino a|larga? fino a)?\s*(\d+(?:[,.]\d+)?)\s*(cm|m)\b/i);
  if (!match) return SCONOSCIUTO;
  return `${match[1].replace(",", ".")} ${match[2].toLowerCase()}`;
}

function periodoBuioDaTesto(testo: string) {
  const testoNorm = normalizza(testo);
  if (testoNorm.includes("buio")) return testo.match(/[^.?!]*buio[^.?!]*/i)?.[0].trim() ?? SCONOSCIUTO;
  if (testoNorm.includes("luminoso") || testoNorm.includes("luce")) return "No buio: tenere in luce";
  return SCONOSCIUTO;
}

export function schedaColtivazioneSuggerita(varKey: string | null, genusId: string | null): SchedaColtivazioneSuggerita {
  const varieta = varKey ? getVarietaByKey(varKey) : undefined;
  const genereId = varieta?.genere ?? genusId ?? "";
  const genere = genereId ? getGenere(genereId) : undefined;
  const testo = varieta ? `${varieta.descrizione}. ${varieta.note}` : "";
  const fallback = DIMENSIONI_PER_GENERE[genere?.id ?? genereId] ?? {
    maxHeight: SCONOSCIUTO,
    maxWidth: SCONOSCIUTO,
  };

  return {
    maxHeight: varieta ? dimensioneDaTesto(testo, ["alta", "altezza", "erette", "fusti", "steli"]) : fallback.maxHeight,
    maxWidth: varieta ? dimensioneDaTesto(testo, ["larga", "larghezza", "rosetta", "espanso", "cuscini"]) : fallback.maxWidth,
    darkPeriod: periodoBuioDaTesto(testo) !== SCONOSCIUTO
      ? periodoBuioDaTesto(testo)
      : BUIO_PER_GENERE[genere?.id ?? genereId] ?? SCONOSCIUTO,
  };
}
