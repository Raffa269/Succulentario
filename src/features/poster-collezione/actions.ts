"use server";

import { createClient } from "@/lib/supabase/server";
import { esportaBackup } from "@/app/actions/export";
import { AVVISO_POSTER, MINIMO_PIANTE_POSTER, POSTER_COLLEZIONE_ABILITATO } from "./config";

export async function preparaPoster(): Promise<{ html: string } | { error: string }> {
  if (!POSTER_COLLEZIONE_ABILITATO) return { error: "Funzione non disponibile." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Accedi per scaricare i file della tua collezione." };
  const { count, error } = await supabase.from("plants")
    .select("id", { count: "exact", head: true }).eq("owner", user.id).eq("kind", "collection");
  if (error) return { error: "Non riesco a verificare la collezione. Riprova tra poco." };
  if ((count ?? 0) < MINIMO_PIANTE_POSTER) return { error: AVVISO_POSTER };
  try {
    return { html: await esportaBackup() };
  } catch {
    return { error: "Non riesco a preparare il backup. Riprova tra poco." };
  }
}
