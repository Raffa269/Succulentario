import { createClient } from "@/lib/supabase/server";
import { urlFirmate } from "@/lib/foto-url";
import type { Plant, PlantKind } from "@/lib/plants";

/** Piante dell'utente per un dato stato (collezione/wishlist/cimitero), con le URL firmate delle foto già pronte. */
export async function caricaPiante(kind: PlantKind) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("plants")
    .select("*")
    .eq("owner", user!.id)
    .eq("kind", kind)
    .order("added_at", { ascending: false });

  if (error) throw new Error(error.message);

  const piante = (data ?? []) as Plant[];
  const mappa = await urlFirmate(
    supabase,
    piante.map((p) => p.photo_path),
  );

  const fotoUrl: Record<string, string> = {};
  for (const p of piante) {
    if (p.photo_path && mappa.has(p.photo_path)) {
      fotoUrl[p.id] = mappa.get(p.photo_path)!;
    }
  }

  return { piante, fotoUrl };
}
