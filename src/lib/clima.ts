import { getVarietaByKey, type Ricovero, type Varieta } from "@/lib/catalogo";
import type { Plant } from "@/lib/plants";

export const COOKIE_CITTA = "succulentario_city";
export const COOKIE_CLIMA = "succulentario_climate";

export interface CittaClimatica {
  id: string;
  nome: string;
}

export interface MedieMensiliClima {
  mese: number;
  media: number;
  minima: number;
  massima: number;
}

export interface ProfiloClimatico {
  cityId: string;
  nome: string;
  monthly: MedieMensiliClima[];
  fonte: string;
  updatedAt?: string;
}

function c(id: string, nome: string): CittaClimatica {
  return { id, nome };
}

export const CAPOLUOGHI_PROVINCIA: CittaClimatica[] = [
  c("agrigento", "Agrigento"),
  c("alessandria", "Alessandria"),
  c("ancona", "Ancona"),
  c("aosta", "Aosta"),
  c("arezzo", "Arezzo"),
  c("ascoli-piceno", "Ascoli Piceno"),
  c("asti", "Asti"),
  c("avellino", "Avellino"),
  c("bari", "Bari"),
  c("barletta", "Barletta"),
  c("andria", "Andria"),
  c("trani", "Trani"),
  c("belluno", "Belluno"),
  c("benevento", "Benevento"),
  c("bergamo", "Bergamo"),
  c("biella", "Biella"),
  c("bologna", "Bologna"),
  c("bolzano", "Bolzano"),
  c("brescia", "Brescia"),
  c("brindisi", "Brindisi"),
  c("cagliari", "Cagliari"),
  c("caltanissetta", "Caltanissetta"),
  c("campobasso", "Campobasso"),
  c("carbonia", "Carbonia"),
  c("carrara", "Carrara"),
  c("caserta", "Caserta"),
  c("catania", "Catania"),
  c("catanzaro", "Catanzaro"),
  c("cesena", "Cesena"),
  c("chieti", "Chieti"),
  c("como", "Como"),
  c("cosenza", "Cosenza"),
  c("cremona", "Cremona"),
  c("crotone", "Crotone"),
  c("cuneo", "Cuneo"),
  c("enna", "Enna"),
  c("fermo", "Fermo"),
  c("ferrara", "Ferrara"),
  c("firenze", "Firenze"),
  c("foggia", "Foggia"),
  c("forli", "Forli"),
  c("frosinone", "Frosinone"),
  c("genova", "Genova"),
  c("gorizia", "Gorizia"),
  c("grosseto", "Grosseto"),
  c("imperia", "Imperia"),
  c("isernia", "Isernia"),
  c("laquila", "L'Aquila"),
  c("la-spezia", "La Spezia"),
  c("latina", "Latina"),
  c("lecce", "Lecce"),
  c("lecco", "Lecco"),
  c("livorno", "Livorno"),
  c("lodi", "Lodi"),
  c("lucca", "Lucca"),
  c("macerata", "Macerata"),
  c("mantova", "Mantova"),
  c("massa", "Massa"),
  c("matera", "Matera"),
  c("messina", "Messina"),
  c("milano", "Milano"),
  c("modena", "Modena"),
  c("monza", "Monza"),
  c("napoli", "Napoli"),
  c("novara", "Novara"),
  c("nuoro", "Nuoro"),
  c("oristano", "Oristano"),
  c("padova", "Padova"),
  c("palermo", "Palermo"),
  c("parma", "Parma"),
  c("pavia", "Pavia"),
  c("perugia", "Perugia"),
  c("pesaro", "Pesaro"),
  c("pescara", "Pescara"),
  c("piacenza", "Piacenza"),
  c("pisa", "Pisa"),
  c("pistoia", "Pistoia"),
  c("pordenone", "Pordenone"),
  c("potenza", "Potenza"),
  c("prato", "Prato"),
  c("ragusa", "Ragusa"),
  c("ravenna", "Ravenna"),
  c("reggio-calabria", "Reggio Calabria"),
  c("reggio-emilia", "Reggio Emilia"),
  c("rieti", "Rieti"),
  c("rimini", "Rimini"),
  c("roma", "Roma"),
  c("rovigo", "Rovigo"),
  c("salerno", "Salerno"),
  c("sassari", "Sassari"),
  c("savona", "Savona"),
  c("siena", "Siena"),
  c("siracusa", "Siracusa"),
  c("sondrio", "Sondrio"),
  c("taranto", "Taranto"),
  c("teramo", "Teramo"),
  c("terni", "Terni"),
  c("torino", "Torino"),
  c("trapani", "Trapani"),
  c("trento", "Trento"),
  c("treviso", "Treviso"),
  c("trieste", "Trieste"),
  c("udine", "Udine"),
  c("urbino", "Urbino"),
  c("varese", "Varese"),
  c("venezia", "Venezia"),
  c("verbania", "Verbania"),
  c("vercelli", "Vercelli"),
  c("verona", "Verona"),
  c("vibo-valentia", "Vibo Valentia"),
  c("vicenza", "Vicenza"),
  c("viterbo", "Viterbo"),
];

export const CLIMA_ROMA_DEFAULT: ProfiloClimatico = {
  cityId: "roma",
  nome: "Roma",
  fonte: "fallback locale Roma",
  monthly: [
    { mese: 1, media: 8.5, minima: 3.5, massima: 13.2 },
    { mese: 2, media: 9.3, minima: 4.1, massima: 14.1 },
    { mese: 3, media: 11.8, minima: 6.2, massima: 17.3 },
    { mese: 4, media: 15.0, minima: 9.0, massima: 20.8 },
    { mese: 5, media: 19.1, minima: 12.8, massima: 25.4 },
    { mese: 6, media: 23.3, minima: 16.6, massima: 30.1 },
    { mese: 7, media: 26.1, minima: 19.2, massima: 33.0 },
    { mese: 8, media: 26.0, minima: 19.4, massima: 32.6 },
    { mese: 9, media: 22.2, minima: 16.2, massima: 28.2 },
    { mese: 10, media: 17.4, minima: 12.0, massima: 22.8 },
    { mese: 11, media: 12.5, minima: 7.7, massima: 17.3 },
    { mese: 12, media: 9.1, minima: 4.5, massima: 13.7 },
  ],
};

const cittaById = new Map(CAPOLUOGHI_PROVINCIA.map((citta) => [citta.id, citta]));

export function normalizzaTesto(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getCittaClimatica(id: string | null | undefined): CittaClimatica {
  return (id ? cittaById.get(id) : undefined) ?? { id: CLIMA_ROMA_DEFAULT.cityId, nome: CLIMA_ROMA_DEFAULT.nome };
}

export function serializzaProfiloClimatico(profilo: ProfiloClimatico): string {
  return encodeURIComponent(JSON.stringify(profilo));
}

export function profiloClimaticoDaCookie(
  cityIdCookie: string | undefined,
  climaCookie: string | undefined,
): ProfiloClimatico {
  const citta = getCittaClimatica(cityIdCookie);
  if (!climaCookie) return { ...CLIMA_ROMA_DEFAULT, cityId: citta.id, nome: citta.nome };

  try {
    const parsed = JSON.parse(decodeURIComponent(climaCookie)) as Partial<ProfiloClimatico>;
    const monthly = Array.isArray(parsed.monthly) ? parsed.monthly : [];
    const mesiValidi = monthly.length === 12 && monthly.every((m) =>
      typeof m?.mese === "number" &&
      typeof m?.media === "number" &&
      typeof m?.minima === "number" &&
      typeof m?.massima === "number",
    );

    if (parsed.cityId === citta.id && mesiValidi) {
      return {
        cityId: citta.id,
        nome: citta.nome,
        monthly: monthly as MedieMensiliClima[],
        fonte: parsed.fonte ?? "medie salvate",
        updatedAt: parsed.updatedAt,
      };
    }
  } catch {
    return { ...CLIMA_ROMA_DEFAULT, cityId: citta.id, nome: citta.nome };
  }

  return { ...CLIMA_ROMA_DEFAULT, cityId: citta.id, nome: citta.nome };
}

export function temperatureChiave(clima: ProfiloClimatico) {
  const inverno = clima.monthly.filter((m) => m.mese === 12 || m.mese <= 2);
  const estate = clima.monthly.filter((m) => m.mese >= 6 && m.mese <= 8);
  return {
    minimaInvernaleMedia: Math.min(...inverno.map((m) => m.minima)),
    massimaEstivaMedia: Math.max(...estate.map((m) => m.massima)),
  };
}

export function ricoveroPerClima(ricovero: Ricovero, clima: ProfiloClimatico): Ricovero {
  const { minimaInvernaleMedia } = temperatureChiave(clima);

  if (ricovero === "fuori") return "fuori";
  if (ricovero === "riparo") {
    if (minimaInvernaleMedia >= 7) return "fuori";
    if (minimaInvernaleMedia <= 1) return "casa";
    return "riparo";
  }
  if (ricovero === "casa") {
    if (minimaInvernaleMedia >= 11) return "riparo";
    return "casa";
  }
  if (minimaInvernaleMedia >= 13) return "casa";
  return "casa!";
}

export function ricoveroVarietaPerClima(varieta: Varieta, clima: ProfiloClimatico): Ricovero {
  return ricoveroPerClima(varieta.ricovero, clima);
}

export function ricoveroPerPianta(pianta: Plant, clima: ProfiloClimatico): Ricovero | undefined {
  const varieta = pianta.var_key ? getVarietaByKey(pianta.var_key) : undefined;
  return varieta ? ricoveroVarietaPerClima(varieta, clima) : undefined;
}
