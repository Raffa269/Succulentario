export type TipoIntervento = "irrigazione" | "fertilizzazione" | "propagazione" | "nota";

export interface InterventoCalendario {
  id: string;
  owner: string;
  event_date: string;
  kind: TipoIntervento;
  note: string;
  created_at: string;
}

export const TIPI_INTERVENTO: TipoIntervento[] = [
  "irrigazione",
  "fertilizzazione",
  "propagazione",
  "nota",
];

export const ICONA_INTERVENTO: Record<TipoIntervento, string> = {
  irrigazione: "💧",
  fertilizzazione: "◈",
  propagazione: "♧",
  nota: "✎",
};

export const ETICHETTA_INTERVENTO: Record<TipoIntervento, string> = {
  irrigazione: "Irrigazione",
  fertilizzazione: "Fertilizzazione",
  propagazione: "Propagazione",
  nota: "Nota",
};

export function formattaGiornoMese(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}
