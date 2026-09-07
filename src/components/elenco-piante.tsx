"use client";

import { useMemo, useState } from "react";
import { PlantCard } from "@/components/plant-card";
import { getGenere } from "@/lib/catalogo";
import type { Plant } from "@/lib/plants";

type Ordinamento = "catalogo" | "recenti" | "nome" | "genere";

const ETICHETTA_ORDINE: Record<Ordinamento, string> = {
  catalogo: "Numero",
  recenti: "Più recenti",
  nome: "Nome",
  genere: "Genere",
};

function nomeGenere(p: Plant): string {
  return p.genus_id ? (getGenere(p.genus_id)?.nome ?? "") : "";
}

/**
 * Griglia con ricerca e ordinamento, condivisa da collezione, wishlist e
 * cimitero (SPECIFICA.md §8.1: "ricerca per nome, varietà, genere e note;
 * ordinamento per catalogo, acquisto più recente, nome, genere").
 */
export function ElencoPiante({
  piante,
  fotoUrl,
  ordinamenti = ["nome"],
  vuoto,
}: {
  piante: Plant[];
  fotoUrl: Record<string, string>;
  ordinamenti?: Ordinamento[];
  vuoto: string;
}) {
  const [query, setQuery] = useState("");
  const [ordine, setOrdine] = useState<Ordinamento>(ordinamenti[0]);

  const risultato = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtrate = q
      ? piante.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.notes.toLowerCase().includes(q) ||
            nomeGenere(p).toLowerCase().includes(q),
        )
      : piante;

    const ordinate = [...filtrate];
    if (ordine === "catalogo") ordinate.sort((a, b) => (a.num ?? 0) - (b.num ?? 0));
    else if (ordine === "recenti") ordinate.sort((a, b) => b.added_at.localeCompare(a.added_at));
    else if (ordine === "nome") ordinate.sort((a, b) => a.name.localeCompare(b.name, "it"));
    else if (ordine === "genere")
      ordinate.sort((a, b) => nomeGenere(a).localeCompare(nomeGenere(b), "it"));

    return ordinate;
  }, [piante, query, ordine]);

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca…"
          className="h-11 flex-1 rounded-lg border border-black/10 bg-[var(--color-surface)] px-3 text-base text-[var(--color-text)] outline-none focus:border-[var(--color-fuori)]"
        />
        {ordinamenti.length > 1 && (
          <select
            value={ordine}
            onChange={(e) => setOrdine(e.target.value as Ordinamento)}
            className="h-11 rounded-lg border border-black/10 bg-[var(--color-surface)] px-2 text-sm text-[var(--color-text)]"
          >
            {ordinamenti.map((o) => (
              <option key={o} value={o}>
                {ETICHETTA_ORDINE[o]}
              </option>
            ))}
          </select>
        )}
      </div>

      {risultato.length === 0 ? (
        <p className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">{vuoto}</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {risultato.map((p) => (
            <PlantCard key={p.id} plant={p} fotoUrl={fotoUrl[p.id]} />
          ))}
        </div>
      )}
    </div>
  );
}
