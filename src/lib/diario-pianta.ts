export const SISTEMAZIONI = ["in casa", "terrazzo coperto", "terrazzo scoperto"] as const;
export const ORIENTAMENTI = ["nord", "nord-est", "est", "sud-est", "sud", "sud-ovest", "ovest", "nord-ovest"] as const;
export type Sistemazione = typeof SISTEMAZIONI[number];
export type Orientamento = typeof ORIENTAMENTI[number];

export interface NotaPianta {
  id: string;
  text: string;
  created_at: string;
}

export function formattaDataCompleta(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Rome",
  });
}

