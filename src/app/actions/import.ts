"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PlantKind } from "@/lib/plants";

async function clientAutenticato() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autenticato.");
  return { supabase, userId: user.id };
}

/** "Sostituisci tutto" (SPECIFICA.md §7): svuota le piante attuali, foto comprese, prima di reimportare. */
export async function svuotaPiante() {
  const { supabase, userId } = await clientAutenticato();

  const { data: esistenti } = await supabase.from("plants").select("photo_path").eq("owner", userId);
  const percorsi = (esistenti ?? [])
    .map((p) => p.photo_path)
    .filter((p): p is string => Boolean(p));
  if (percorsi.length > 0) {
    await supabase.storage.from("foto").remove(percorsi);
  }

  const { error } = await supabase.from("plants").delete().eq("owner", userId);
  if (error) throw new Error(error.message);
}

export interface VoceImport {
  importId: string;
  kind: PlantKind;
  name: string;
  genusId: string | null;
  varKey: string | null;
  photoPath: string | null;
  num: number | null;
  purchaseYm: string | null;
  propSoil: boolean;
  propHum: boolean;
  notes: string;
  addedAt: string | null;
  lostYm: string | null;
  cause: string | null;
  lesson: string | null;
}

/**
 * Importa una voce del backup (la foto è già stata caricata lato client:
 * qui arriva solo il percorso). In modalità "unisci" fa un upsert su
 * (owner, import_id) — le importazioni ripetute dello stesso backup
 * aggiornano la riga invece di duplicarla.
 */
export async function importaVoce(voce: VoceImport, modalita: "sostituisci" | "unisci") {
  const { supabase, userId } = await clientAutenticato();

  const riga = {
    owner: userId,
    kind: voce.kind,
    name: voce.name,
    genus_id: voce.genusId,
    var_key: voce.varKey,
    photo_path: voce.photoPath,
    num: voce.num,
    purchase_ym: voce.purchaseYm,
    prop_soil: voce.propSoil,
    prop_hum: voce.propHum,
    notes: voce.notes,
    lost_ym: voce.lostYm,
    cause: voce.cause,
    lesson: voce.lesson,
    import_id: voce.importId,
    ...(voce.addedAt ? { added_at: voce.addedAt } : {}),
  };

  const { error } =
    modalita === "unisci"
      ? await supabase.from("plants").upsert(riga, { onConflict: "owner,import_id" })
      : await supabase.from("plants").insert(riga);

  if (error) throw new Error(error.message);
}

export async function fineImportazione() {
  revalidatePath("/collezione");
  revalidatePath("/wishlist");
  revalidatePath("/cimitero");
}
