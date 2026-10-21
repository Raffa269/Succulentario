import { PDFDocument, rgb, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { formattaDataCompleta } from "@/lib/diario-pianta";

interface VocePdf {
  kind: string;
  num: number | null;
  name: string;
  genusId: string | null;
  varKey: string | null;
  photoDataUrl: string | null;
  purchaseYm: string | null;
  propSoil: boolean;
  propHum: boolean;
  notes: string;
  noteEntries?: { text: string; created_at: string; updated_at?: string }[];
  sistemazione?: string | null;
  orientamento?: string | null;
  addedAt: string | null;
  lostYm: string | null;
  cause: string | null;
  lesson: string;
}

/** Generazione locale nel browser: i dati dell'utente non passano da servizi PDF esterni. */
export async function creaPdfBackup(html: string, fontBytes: ArrayBuffer | Uint8Array): Promise<Uint8Array> {
  const match = /<script[^>]*id=["']succulentario-data["'][^>]*>([\s\S]*?)<\/script>/i.exec(html);
  if (!match) throw new Error("Dati del backup non trovati.");
  const payload = JSON.parse(match[1]) as { app: string; exportedAt: string; plants: VocePdf[] };
  if (payload.app !== "succulentario" || !Array.isArray(payload.plants)) throw new Error("Backup non valido.");

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontBytes, { subset: true });
  const caratteri = new Set(font.getCharacterSet());
  const testoSicuro = (s: string) => Array.from(s.normalize("NFC").replace(/[\u0000-\u0008\u000b-\u001f]/g, ""))
    .map((c) => c === "\n" || caratteri.has(c.codePointAt(0)!) ? c : "?").join("");
  const prugna = rgb(0.478, 0.18, 0.525);
  const testo = rgb(0.125, 0.118, 0.114);
  const secondario = rgb(0.39, 0.36, 0.31);
  const margine = 44;
  const larghezza = 595.28;
  const altezza = 841.89;
  const spazio = larghezza - margine * 2;
  let pagina: PDFPage;
  let y = 0;
  let intestazione = "Backup della collezione";

  function nuovaPagina() {
    pagina = pdf.addPage([larghezza, altezza]);
    pagina.drawRectangle({ x: 0, y: altezza - 65, width: larghezza, height: 65, color: rgb(0.96, 0.92, 0.85) });
    pagina.drawText("succulentario", { x: margine, y: altezza - 35, font, size: 21, color: prugna });
    pagina.drawText(testoSicuro(intestazione).slice(0, 90), { x: margine, y: altezza - 52, font, size: 9, color: secondario });
    y = altezza - 95;
  }

  function spazioPer(h: number) {
    if (y - h < 52) nuovaPagina();
  }

  function scrivi(s: string, dimensione = 10, colore = testo) {
    const interlinea = dimensione * 1.45;
    const paragrafi = testoSicuro(s).split(/\r?\n/);
    for (const paragrafo of paragrafi) {
      const righe: string[] = [];
      let riga = "";
      // Anche URL o parole molto lunghe vengono spezzati senza uscire dai margini.
      for (const parola of paragrafo.split(/\s+/)) {
        const candidata = riga ? `${riga} ${parola}` : parola;
        if (font.widthOfTextAtSize(candidata, dimensione) <= spazio) { riga = candidata; continue; }
        if (riga) { righe.push(riga); riga = ""; }
        for (const carattere of Array.from(parola)) {
          if (font.widthOfTextAtSize(riga + carattere, dimensione) > spazio) { righe.push(riga); riga = ""; }
          riga += carattere;
        }
      }
      righe.push(riga);
      for (const r of righe) {
        spazioPer(interlinea);
        if (r) pagina.drawText(r, { x: margine, y, size: dimensione, font, color: colore });
        y -= interlinea;
      }
    }
  }

  function campo(nome: string, valore: string | null | undefined) {
    if (valore) scrivi(`${nome}: ${valore}`);
  }

  const stato: Record<string, string> = { collection: "Collezione", wishlist: "Wishlist", lost: "Cimitero" };
  nuovaPagina();
  scrivi("Il tuo Succulentario", 25, prugna);
  y -= 12;
  scrivi(`Esportato il ${formattaDataCompleta(payload.exportedAt)}`, 11, secondario);
  y -= 20;
  for (const [kind, nome] of Object.entries(stato)) {
    scrivi(`${nome}: ${payload.plants.filter((p) => p.kind === kind).length} piante`, 14);
  }
  y -= 20;
  scrivi("Catalogo personale con fotografie e note.", 11, secondario);
  scrivi("Per ripristinare i dati nell'app, conserva anche il backup in formato HTML.", 10, secondario);
  if (!payload.plants.length) scrivi("Non ci sono ancora piante da esportare.");

  for (const p of payload.plants) {
    intestazione = `${stato[p.kind] ?? p.kind} - ${p.name}`;
    nuovaPagina();
    scrivi(p.name, 20, prugna);
    scrivi(`${stato[p.kind] ?? p.kind}${p.num !== null ? ` | N. ${String(p.num).padStart(3, "0")}` : ""}`, 10, secondario);
    y -= 12;
    if (p.photoDataUrl) {
      try {
        const immagine = p.photoDataUrl.startsWith("data:image/png")
          ? await pdf.embedPng(p.photoDataUrl) : await pdf.embedJpg(p.photoDataUrl);
        const dimensioni = immagine.scaleToFit(spazio, 170);
        spazioPer(dimensioni.height + 15);
        pagina!.drawImage(immagine, { x: margine, y: y - dimensioni.height, ...dimensioni });
        y -= dimensioni.height + 18;
      } catch {
        scrivi("Fotografia non disponibile nel PDF.", 9, secondario);
      }
    }
    campo("Genere", p.genusId);
    campo("Varietà", p.varKey);
    campo("Acquisto (anno-mese)", p.purchaseYm);
    campo("Sistemazione", p.sistemazione);
    campo("Orientamento", p.orientamento);
    campo("L'ho propagata", [p.propSoil && "In terra", p.propHum && "Per umidità"].filter(Boolean).join(", ") || "Ancora no");
    campo("Aggiunta il", p.addedAt ? formattaDataCompleta(p.addedAt) : null);
    campo("Perdita (anno-mese)", p.lostYm);
    campo("Causa", p.cause);
    campo("Lezione imparata", p.lesson);
    if (p.notes || p.noteEntries?.length) {
      y -= 14;
      spazioPer(42);
      scrivi("Note", 15, prugna);
      if (p.notes) { scrivi("Nota precedente - data non disponibile", 9, secondario); scrivi(p.notes); y -= 8; }
      for (const n of p.noteEntries ?? []) {
        spazioPer(44);
        scrivi(`${formattaDataCompleta(n.created_at)}${n.updated_at ? ` | Modificata il ${formattaDataCompleta(n.updated_at)}` : ""}`, 9, secondario);
        scrivi(n.text);
        y -= 8;
      }
    }
  }

  const pagine = pdf.getPages();
  pagine.forEach((p, i) => {
    p.drawLine({ start: { x: margine, y: 38 }, end: { x: larghezza - margine, y: 38 }, thickness: 0.5, color: rgb(0.85, 0.82, 0.77) });
    p.drawText(`${formattaDataCompleta(payload.exportedAt)} | ${i + 1} / ${pagine.length}`, { x: margine, y: 24, font, size: 8, color: secondario });
  });
  pdf.setTitle("Succulentario - catalogo personale");
  pdf.setCreator("Succulentario");
  pdf.setLanguage("it-IT");
  return pdf.save();
}

