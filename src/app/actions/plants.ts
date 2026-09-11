"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVarietaByKey } from "@/lib/catalogo";
import { meseCorrente, type PlantKind } from "@/lib/plants";

async function clientAutenticato() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autenticato.");
  return { supabase, userId: user.id };
}

async function prossimoNumero(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<number> {
  const { data } = await supabase
    .from("plants")
    .select("num")
    .eq("owner", userId)
    .eq("kind", "collection")
    .order("num", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  return (data?.num ?? 0) + 1;
}

async function cancellaFotoSePresente(
  supabase: Awaited<ReturnType<typeof createClient>>,
  photoPath: string | null,
) {
  if (photoPath) {
    await supabase.storage.from("foto").remove([photoPath]);
  }
}

/** Pulsanti "Ho questa" / "La voglio" sulle schede genere: un clic, nessun modulo. */
export async function creaDaVarieta(kind: "collection" | "wishlist", varKey: string) {
  const { supabase, userId } = await clientAutenticato();
  const varieta = getVarietaByKey(varKey);
  if (!varieta) throw new Error("Varietà non trovata nel catalogo.");

  const num = kind === "collection" ? await prossimoNumero(supabase, userId) : null;

  const { data, error } = await supabase
    .from("plants")
    .insert({
      owner: userId,
      kind,
      name: varieta.nome,
      genus_id: varieta.genere,
      var_key: varieta.key,
      num,
      purchase_ym: kind === "collection" ? meseCorrente() : null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/collezione");
  revalidatePath("/wishlist");
  redirect(`/piante/${data.id}`);
}

/**
 * Aggiunta manuale (senza una varietà schedata di riferimento). Chiamata
 * sempre da codice client (serve JS comunque per comprimere/caricare la
 * foto prima): ritorna l'id invece di reindirizzare, così chi chiama può
 * gestire la navigazione senza intercettare per sbaglio il redirect come
 * se fosse un errore.
 */
export async function creaManuale(formData: FormData) {
  const { supabase, userId } = await clientAutenticato();

  const kind = String(formData.get("kind") ?? "collection") as PlantKind;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Il nome è obbligatorio.");

  const genusId = String(formData.get("genusId") ?? "").trim() || null;
  const varKey = String(formData.get("varKey") ?? "").trim() || null;
  const photoPath = String(formData.get("photoPath") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim();
  const purchaseYmForm = String(formData.get("purchaseYm") ?? "").trim() || null;
  const propSoil = formData.get("propSoil") === "1";
  const propHum = formData.get("propHum") === "1";
  const num = kind === "collection" ? await prossimoNumero(supabase, userId) : null;

  const { data, error } = await supabase
    .from("plants")
    .insert({
      owner: userId,
      kind,
      name,
      genus_id: genusId,
      var_key: varKey,
      photo_path: photoPath,
      notes,
      num,
      prop_soil: propSoil,
      prop_hum: propHum,
      purchase_ym: kind === "collection" ? (purchaseYmForm ?? meseCorrente()) : null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  // La prima foto entra anche nella cronologia di crescita (plant_photos),
  // così la timeline sulla scheda pianta parte dal giorno dell'aggiunta
  // invece che dalla prima foto successiva caricata a mano.
  if (photoPath) {
    await supabase.from("plant_photos").insert({ owner: userId, plant_id: data.id, photo_path: photoPath });
  }

  revalidatePath("/collezione");
  revalidatePath("/wishlist");
  return { id: data.id as string };
}

export interface CampiPianta {
  name: string;
  genusId: string | null;
  purchaseYm: string | null;
  propSoil: boolean;
  propHum: boolean;
  notes: string;
  casaTuttoAnno: boolean;
  photoPath?: string | null;
}

/** Aggiorna i campi di una pianta esistente (pagina di dettaglio). */
export async function aggiornaPianta(id: string, campi: CampiPianta, fotoPrecedente: string | null) {
  const { supabase } = await clientAutenticato();

  if (campi.photoPath !== undefined && campi.photoPath !== fotoPrecedente) {
    await cancellaFotoSePresente(supabase, fotoPrecedente);
  }

  const { error } = await supabase
    .from("plants")
    .update({
      name: campi.name,
      genus_id: campi.genusId,
      purchase_ym: campi.purchaseYm,
      prop_soil: campi.propSoil,
      prop_hum: campi.propHum,
      notes: campi.notes,
      casa_tutto_anno: campi.casaTuttoAnno,
      ...(campi.photoPath !== undefined ? { photo_path: campi.photoPath } : {}),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/collezione");
  revalidatePath("/wishlist");
  revalidatePath(`/piante/${id}`);
}

/** Aggiunge una foto alla cronologia di crescita della pianta (galleria datata sulla scheda). */
export async function aggiungiFotoCrescita(plantId: string, photoPath: string) {
  const { supabase, userId } = await clientAutenticato();

  const { error } = await supabase
    .from("plant_photos")
    .insert({ owner: userId, plant_id: plantId, photo_path: photoPath });
  if (error) throw new Error(error.message);

  revalidatePath(`/piante/${plantId}`);
}

/** Toglie una foto dalla cronologia di crescita (non tocca la foto di copertina). */
export async function eliminaFotoCrescita(fotoId: string, plantId: string, photoPath: string) {
  const { supabase } = await clientAutenticato();

  await cancellaFotoSePresente(supabase, photoPath);

  const { error } = await supabase.from("plant_photos").delete().eq("id", fotoId);
  if (error) throw new Error(error.message);

  revalidatePath(`/piante/${plantId}`);
}

/** Wishlist -> collezione, in un clic: mese corrente come acquisto (SPECIFICA.md §8.1). */
export async function promuoviACollezione(id: string) {
  const { supabase, userId } = await clientAutenticato();
  const num = await prossimoNumero(supabase, userId);

  const { error } = await supabase
    .from("plants")
    .update({ kind: "collection", num, purchase_ym: meseCorrente() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/collezione");
  revalidatePath("/wishlist");
  revalidatePath(`/piante/${id}`);
}

/** Collezione -> cimitero. */
export async function spostaInCimitero(
  id: string,
  campi: { lostYm: string; cause: string; lesson: string },
) {
  const { supabase } = await clientAutenticato();

  const { error } = await supabase
    .from("plants")
    .update({
      kind: "lost",
      lost_ym: campi.lostYm || null,
      cause: campi.cause || null,
      lesson: campi.lesson || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/collezione");
  revalidatePath("/cimitero");
  revalidatePath(`/piante/${id}`);
}

/** Cimitero -> collezione. */
export async function riportaInCollezione(id: string) {
  const { supabase, userId } = await clientAutenticato();
  const num = await prossimoNumero(supabase, userId);

  const { error } = await supabase
    .from("plants")
    .update({
      kind: "collection",
      num,
      purchase_ym: meseCorrente(),
      lost_ym: null,
      cause: null,
      lesson: null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/collezione");
  revalidatePath("/cimitero");
  revalidatePath(`/piante/${id}`);
}

/** Chiamata da client (di solito dopo una conferma): niente redirect qui, vedi creaManuale. */
export async function eliminaPianta(id: string, photoPath: string | null) {
  const { supabase } = await clientAutenticato();

  await cancellaFotoSePresente(supabase, photoPath);

  // La cancellazione della riga si propaga a plant_photos (on delete
  // cascade), ma non ai file nello Storage: vanno tolti a mano prima,
  // altrimenti restano foto orfane nel bucket.
  const { data: fotoCrescita } = await supabase.from("plant_photos").select("photo_path").eq("plant_id", id);
  const percorsiCrescita = (fotoCrescita ?? []).map((f) => f.photo_path);
  if (percorsiCrescita.length > 0) {
    await supabase.storage.from("foto").remove(percorsiCrescita);
  }

  const { error } = await supabase.from("plants").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/collezione");
  revalidatePath("/wishlist");
  revalidatePath("/cimitero");
}
