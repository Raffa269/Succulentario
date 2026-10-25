"use client";

import { useState } from "react";
import { preparaPoster } from "./actions";
import { FILE_POSTER } from "./config";
import { creaZip } from "./zip";

export function ScaricaPoster() {
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState("");
  const [completato, setCompletato] = useState(false);
  async function scarica() {
    setInCorso(true);
    setErrore("");
    setCompletato(false);
    try {
      const risultato = await preparaPoster();
      if ("error" in risultato) { setErrore(risultato.error); return; }
      const files = await Promise.all(FILE_POSTER.map(async (nome) => {
        const response = await fetch(`/poster-collezione/${encodeURIComponent(nome)}`);
        if (!response.ok) throw new Error("Asset non disponibile");
        // Evita di includere una pagina di login al posto del file.
        const mime = response.headers.get("content-type") ?? "";
        if (mime.includes("text/html")) throw new Error("Sessione scaduta");
        return { nome, dati: new Uint8Array(await response.arrayBuffer()) };
      }));
      const data = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });
      const zip = creaZip([{ nome: `succulentario-backup-${data}.html`, dati: new TextEncoder().encode(risultato.html) }, ...files]);
      const url = URL.createObjectURL(zip);
      const link = document.createElement("a");
      link.href = url;
      link.download = `poster-collezione-${data}.zip`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setCompletato(true);
    } catch {
      setErrore("Non riesco a scaricare i file. Controlla la connessione e riprova.");
    } finally { setInCorso(false); }
  }
  return (
    <div className="mt-6">
      <button type="button" onClick={scarica} disabled={inCorso} className="min-h-11 w-full rounded-full bg-[var(--color-brand)] px-5 py-3 font-bold text-white disabled:opacity-60">
        {inCorso ? "Preparo i file…" : "scarica file"}
      </button>
      {errore && <p role="alert" className="mt-3 font-bold text-[var(--color-text)]">{errore}</p>}
      <p role="status" className="mt-3 text-sm text-[var(--color-text-secondary)]">
        {completato ? "Archivio preparato. Apri lo ZIP ed estrai i quattro file prima di caricarli in ChatGPT." : inCorso ? "Il backup include le foto: potrebbe richiedere qualche momento." : "Scaricherai uno ZIP con quattro file. Estraili e allegali insieme a una nuova chat di ChatGPT."}
      </p>
    </div>
  );
}
