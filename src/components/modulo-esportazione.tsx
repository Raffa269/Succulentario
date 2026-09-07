"use client";

import { useState } from "react";
import { esportaBackup } from "@/app/actions/export";

export function ModuloEsportazione() {
  const [generando, setGenerando] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  async function esporta() {
    setGenerando(true);
    setErrore(null);
    try {
      const html = await esportaBackup();
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `succulentario-backup-${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Esportazione fallita.");
    } finally {
      setGenerando(false);
    }
  }

  return (
    <div>
      <button
        onClick={esporta}
        disabled={generando}
        className="h-11 w-full rounded-lg border border-black/10 bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text)] disabled:opacity-60"
      >
        {generando ? "Preparo il file…" : "Esporta backup completo (.html)"}
      </button>
      {errore && <p className="mt-2 text-sm text-[var(--color-casa-esclamativo)]">{errore}</p>}
    </div>
  );
}
