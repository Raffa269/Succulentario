"use client";

import { useState } from "react";
import { esportaBackup } from "@/app/actions/export";

export function ModuloEsportazione() {
  const [generando, setGenerando] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [sceltaAperta, setSceltaAperta] = useState(false);
  const [formato, setFormato] = useState<"html" | "pdf" | null>(null);

  async function esporta(tipo: "html" | "pdf") {
    setGenerando(true);
    setFormato(tipo);
    setErrore(null);
    try {
      const html = await esportaBackup();
      let blob: Blob;
      if (tipo === "pdf") {
        const { creaPdfBackup } = await import("@/lib/backup-pdf");
        const font = await fetch("/fonts/figtree-latin-400-normal.woff");
        if (!font.ok) throw new Error("Non riesco a preparare il PDF. Riprova.");
        const bytes = await creaPdfBackup(html, await font.arrayBuffer());
        blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      } else {
        blob = new Blob([html], { type: "text/html;charset=utf-8" });
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const oggi = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });
      a.download = `succulentario-backup-${oggi}.${tipo}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Esportazione fallita.");
    } finally {
      setGenerando(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => { setSceltaAperta((v) => !v); setErrore(null); }}
        aria-expanded={sceltaAperta}
        aria-controls="formati-backup"
        disabled={generando}
        className="h-11 w-full rounded-lg border border-black/10 bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text)] disabled:opacity-60"
      >
        {generando ? `Preparo il ${formato?.toUpperCase()}…` : "Esporta backup"}
      </button>
      {sceltaAperta && <fieldset id="formati-backup" className="mt-3 flex flex-col gap-2" aria-busy={generando}>
        <legend className="mb-2 text-sm font-bold">Scegli il formato</legend>
        <button type="button" onClick={() => esporta("html")} disabled={generando}
          className="min-h-14 rounded-xl border border-black/10 bg-white p-3 text-left disabled:opacity-50">
          <span className="block font-bold">Salva HTML</span>
          <span className="block text-sm text-[var(--color-text-secondary)]">Backup con foto e note, reimportabile nell’app.</span>
        </button>
        <button type="button" onClick={() => esporta("pdf")} disabled={generando}
          className="min-h-14 rounded-xl border border-black/10 bg-white p-3 text-left disabled:opacity-50">
          <span className="block font-bold">Salva PDF</span>
          <span className="block text-sm text-[var(--color-text-secondary)]">Catalogo con foto e note, da leggere o stampare.</span>
        </button>
      </fieldset>}
      {errore && <p role="alert" className="mt-2 text-sm text-[var(--color-casa-esclamativo)]">{errore}</p>}
    </div>
  );
}

