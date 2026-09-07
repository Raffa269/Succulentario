export type PlantKind = "collection" | "wishlist" | "lost";

export interface Plant {
  id: string;
  owner: string;
  kind: PlantKind;
  num: number | null;
  name: string;
  genus_id: string | null;
  var_key: string | null;
  photo_path: string | null;
  purchase_ym: string | null;
  prop_soil: boolean;
  prop_hum: boolean;
  notes: string;
  added_at: string;
  lost_ym: string | null;
  cause: string | null;
  lesson: string | null;
  updated_at: string;
}

/** 'AAAA-MM' di oggi, per impostare l'acquisto al mese corrente (spec §8.1). */
export function meseCorrente(): string {
  const oggi = new Date();
  return `${oggi.getFullYear()}-${String(oggi.getMonth() + 1).padStart(2, "0")}`;
}

/** "AAAA-MM" -> "settembre 2026", per la visualizzazione. */
export function formattaMese(ym: string | null): string {
  if (!ym) return "";
  const [anno, mese] = ym.split("-").map(Number);
  if (!anno || !mese) return ym;
  const data = new Date(anno, mese - 1, 1);
  return data.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
}
