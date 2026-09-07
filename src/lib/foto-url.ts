import type { createClient } from "@/lib/supabase/server";

const SCADENZA_SECONDI = 60 * 60; // 1 ora: rigenerato a ogni caricamento pagina

/** Bucket privato: le foto si mostrano solo con URL firmati (SPECIFICA.md §9). */
export async function urlFirmate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  percorsi: (string | null)[],
): Promise<Map<string, string>> {
  const validi = percorsi.filter((p): p is string => Boolean(p));
  const mappa = new Map<string, string>();
  if (validi.length === 0) return mappa;

  const { data } = await supabase.storage.from("foto").createSignedUrls(validi, SCADENZA_SECONDI);

  for (const voce of data ?? []) {
    if (voce.signedUrl && voce.path) mappa.set(voce.path, voce.signedUrl);
  }
  return mappa;
}
