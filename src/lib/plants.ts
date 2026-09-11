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
  /** Annotazione dell'utente: questa pianta, a differenza dell'indicazione generale della varietà, sta bene in casa tutto l'anno. */
  casa_tutto_anno: boolean;
}

/** Una foto della cronologia di crescita di una pianta (tabella plant_photos). */
export interface PlantPhoto {
  id: string;
  plant_id: string;
  photo_path: string;
  created_at: string;
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

/** Un timestamp qualsiasi (es. plant_photos.created_at) -> "settembre 2026". */
export function formattaMeseAnnoDaData(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", { month: "long", year: "numeric" });
}
