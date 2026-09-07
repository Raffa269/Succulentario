"use server";

import { createClient } from "@/lib/supabase/server";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Esporta tutte le piante (collezione, wishlist, cimitero) dell'utente in
 * un'unica pagina HTML autosufficiente: leggibile da sola (tabella con
 * tutti i campi) e reimportabile (dati completi, foto incorporate come
 * data URL, in `<script id="succulentario-data">`). Formato proprio
 * dell'app — non quello, diverso, dell'artifact originale (vedi
 * lib/import-backup.ts per l'import, che li riconosce entrambi).
 */
export async function esportaBackup(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autenticato.");

  const { data, error } = await supabase
    .from("plants")
    .select("*")
    .eq("owner", user.id)
    .order("kind")
    .order("num");
  if (error) throw new Error(error.message);

  const piante = data ?? [];

  const voci = await Promise.all(
    piante.map(async (p) => {
      let photoDataUrl: string | null = null;
      if (p.photo_path) {
        const { data: file } = await supabase.storage.from("foto").download(p.photo_path);
        if (file) {
          const buf = await file.arrayBuffer();
          const base64 = Buffer.from(buf).toString("base64");
          photoDataUrl = `data:${file.type || "image/jpeg"};base64,${base64}`;
        }
      }
      return {
        id: p.id as string,
        kind: p.kind as string,
        num: p.num as number | null,
        name: p.name as string,
        genusId: p.genus_id as string | null,
        varKey: p.var_key as string | null,
        photoDataUrl,
        purchaseYm: p.purchase_ym as string | null,
        propSoil: p.prop_soil as boolean,
        propHum: p.prop_hum as boolean,
        notes: (p.notes as string) ?? "",
        addedAt: p.added_at as string | null,
        lostYm: p.lost_ym as string | null,
        cause: p.cause as string | null,
        lesson: (p.lesson as string) ?? "",
      };
    }),
  );

  const payload = {
    app: "succulentario",
    formatVersion: "app-v1",
    exportedAt: new Date().toISOString(),
    plants: voci,
  };

  // < invece di < : evita che un </script> dentro una nota chiuda
  // il tag in anticipo. JSON.parse lo interpreta comunque correttamente.
  const jsonSicuro = JSON.stringify(payload).replace(/</g, "\\u003c");

  const righe = voci
    .map(
      (p) => `<tr>
<td>${escapeHtml(p.kind)}</td>
<td>${p.num ?? ""}</td>
<td>${escapeHtml(p.name)}</td>
<td>${escapeHtml(p.genusId ?? "")}</td>
<td>${escapeHtml(p.varKey ?? "")}</td>
<td>${p.photoDataUrl ? `<img src="${p.photoDataUrl}" alt="" width="60" height="60">` : ""}</td>
<td>${escapeHtml(p.purchaseYm ?? "")}</td>
<td>${p.propSoil ? "sì" : ""}</td>
<td>${p.propHum ? "sì" : ""}</td>
<td>${escapeHtml(p.notes)}</td>
<td>${escapeHtml(p.addedAt ?? "")}</td>
<td>${escapeHtml(p.lostYm ?? "")}</td>
<td>${escapeHtml(p.cause ?? "")}</td>
<td>${escapeHtml(p.lesson)}</td>
</tr>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<title>Succulentario — backup ${new Date().toLocaleDateString("it-IT")}</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; background:#F1F2EC; color:#141811; padding:24px; }
  table { border-collapse: collapse; width: 100%; font-size: 13px; background:#FBFBF7; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #eceee0; }
  img { display:block; border-radius:4px; object-fit:cover; }
  h1 { font-size: 1.4rem; }
</style>
</head>
<body>
<h1>Succulentario — backup completo</h1>
<p>Esportato il ${new Date().toLocaleString("it-IT")}. ${voci.length} piante (collezione, wishlist, cimitero).</p>
<div style="overflow-x:auto">
<table>
<thead><tr>
<th>Stato</th><th>N.</th><th>Nome</th><th>Genere</th><th>Varietà</th><th>Foto</th>
<th>Acquisto</th><th>Terra</th><th>Umidità</th><th>Note</th><th>Aggiunta</th>
<th>Persa il</th><th>Causa</th><th>Lezione</th>
</tr></thead>
<tbody>
${righe}
</tbody>
</table>
</div>
<script id="succulentario-data" type="application/json">${jsonSicuro}</script>
</body>
</html>
`;
}
