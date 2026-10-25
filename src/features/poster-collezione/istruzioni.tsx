"use client";

import Image from "next/image";
import { useState } from "react";
import { FILE_POSTER } from "./config";

const MESSAGGIO = "Leggi il workflow allegato e crea le tre immagini usando i dati del mio backup. Le due immagini sono riferimenti di stile";
const ESEMPI = [
  { nome: FILE_POSTER[1], titolo: "Panoramica della collezione", width: 1536, height: 1024 },
  { nome: FILE_POSTER[2], titolo: "Il percorso della collezione", width: 1055, height: 1491 },
];

export function IstruzioniPoster() {
  const [ingrandite, setIngrandite] = useState<string[]>([]);
  const [esito, setEsito] = useState("");
  async function copia() {
    try {
      await navigator.clipboard.writeText(MESSAGGIO);
      setEsito("Messaggio copiato! Incollalo nella nuova chat insieme ai quattro file.");
    } catch {
      setEsito("Non riesco a copiare automaticamente. Seleziona e copia il messaggio qui sopra.");
    }
  }
  return (
    <>
      <ol className="mt-5 list-decimal space-y-2 pl-5 text-base leading-relaxed">
        <li>Scarica il pacchetto</li>
        <li>Estrai i quattro file</li>
        <li>Allegali insieme in una nuova chat di ChatGPT</li>
      </ol>
      <blockquote className="mt-5 select-text rounded-xl border border-black/10 p-3 text-sm leading-relaxed">{MESSAGGIO}</blockquote>
      <button type="button" onClick={copia} className="mt-3 min-h-11 w-full rounded-full border border-[var(--color-brand)] px-4 py-2 text-sm font-bold text-[var(--color-brand)]">
        Copia il messaggio per ChatGPT
      </button>
      <p role="status" className="mt-2 text-sm text-[var(--color-text-secondary)]">{esito}</p>
      <section aria-label="Immagini di esempio" className="mt-6">
        <h2 className="font-heading text-lg">Due esempi a cui ispirarsi</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Tocca un’immagine per ingrandirla, toccala di nuovo per ridurla.</p>
        <div className="mt-3 grid grid-cols-2 items-start gap-3">
          {ESEMPI.map((esempio) => {
            const grande = ingrandite.includes(esempio.nome);
            return (
              <button key={esempio.nome} type="button" aria-expanded={grande}
                aria-label={`${grande ? "Riduci" : "Ingrandisci"}: ${esempio.titolo}`}
                onClick={() => setIngrandite((attuali) => grande ? attuali.filter((n) => n !== esempio.nome) : [...attuali, esempio.nome])}
                className={`overflow-hidden rounded-xl border border-black/10 bg-white p-2 text-left ${grande ? "col-span-2 cursor-zoom-out" : "cursor-zoom-in"}`}>
                <Image src={`/poster-collezione/${encodeURIComponent(esempio.nome)}`} alt={esempio.titolo}
                  width={esempio.width} height={esempio.height} unoptimized
                  className={grande ? "h-auto w-full" : "h-28 w-full object-contain"} />
                <span className="mt-2 block text-xs font-bold">{esempio.titolo}</span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}
