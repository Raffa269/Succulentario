"use client";

import { useMemo, useState } from "react";
import { PlantCard } from "@/components/plant-card";
import { getGenere, getVarietaByKey, type Ricovero } from "@/lib/catalogo";
import type { Plant } from "@/lib/plants";

type Ordinamento = "catalogo" | "recenti" | "nome" | "genere";

const ETICHETTA_ORDINE: Record<Ordinamento, string> = {
  catalogo: "Numero",
  recenti: "Più recenti",
  nome: "Nome",
  genere: "Genere",
};

const RICOVERI: Ricovero[] = ["fuori", "riparo", "casa", "casa!"];
const COLORE_RICOVERO: Record<Ricovero, { bg: string; testoChiaro: boolean }> = {
  fuori: { bg: "var(--color-fuori)", testoChiaro: true },
  riparo: { bg: "var(--color-riparo)", testoChiaro: true },
  casa: { bg: "var(--color-casa)", testoChiaro: false },
  "casa!": { bg: "var(--color-casa-esclamativo)", testoChiaro: true },
};

function nomeGenere(p: Plant): string {
  return p.genus_id ? (getGenere(p.genus_id)?.nome ?? "") : "";
}

function ricoveroPianta(p: Plant): Ricovero | undefined {
  return p.var_key ? getVarietaByKey(p.var_key)?.ricovero : undefined;
}

/**
 * Griglia con ricerca, filtro per ricovero e ordinamento, condivisa da
 * collezione, wishlist e cimitero (SPECIFICA.md §8.1: "ricerca per nome,
 * varietà, genere e note; ordinamento per catalogo, acquisto più recente,
 * nome, genere"). Stile pillola/lente per la barra di ricerca, mockup 1a.
 */
export function ElencoPiante({
  piante,
  fotoUrl,
  ordinamenti = ["nome"],
  vuoto,
  placeholder = "Cerca…",
}: {
  piante: Plant[];
  fotoUrl: Record<string, string>;
  ordinamenti?: Ordinamento[];
  vuoto: string;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [ordine, setOrdine] = useState<Ordinamento>(ordinamenti[0]);
  const [filtriAperti, setFiltriAperti] = useState(false);
  const [ricoveriAttivi, setRicoveriAttivi] = useState<Set<Ricovero>>(new Set());

  const risultato = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtrate = piante.filter((p) => {
      if (ricoveriAttivi.size > 0) {
        const r = ricoveroPianta(p);
        if (!r || !ricoveriAttivi.has(r)) return false;
      }
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.notes.toLowerCase().includes(q) ||
        nomeGenere(p).toLowerCase().includes(q)
      );
    });

    const ordinate = [...filtrate];
    if (ordine === "catalogo") ordinate.sort((a, b) => (a.num ?? 0) - (b.num ?? 0));
    else if (ordine === "recenti") ordinate.sort((a, b) => b.added_at.localeCompare(a.added_at));
    else if (ordine === "nome") ordinate.sort((a, b) => a.name.localeCompare(b.name, "it"));
    else if (ordine === "genere")
      ordinate.sort((a, b) => nomeGenere(a).localeCompare(nomeGenere(b), "it"));

    return ordinate;
  }, [piante, query, ordine, ricoveriAttivi]);

  function alternaRicovero(r: Ricovero) {
    setRicoveriAttivi((precedente) => {
      const successivo = new Set(precedente);
      if (successivo.has(r)) successivo.delete(r);
      else successivo.add(r);
      return successivo;
    });
  }

  return (
    <div>
      <div className="flex gap-2">
        <div
          className="flex h-12 flex-1 items-center gap-2 rounded-full border border-black/[.16] bg-white px-4"
          style={{ colorScheme: "light" }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#645c50" strokeWidth={2.75} strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M16.5 16.5L21 21" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="h-full flex-1 bg-transparent text-base text-[#201e1d] outline-none placeholder:text-[#645c50]"
          />
        </div>
        <button
          type="button"
          onClick={() => setFiltriAperti((v) => !v)}
          aria-pressed={filtriAperti || ricoveriAttivi.size > 0}
          aria-label="Filtra per ricovero"
          className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--color-neutral-100)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth={2.75} strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h16M7 12h10M10 17h4" />
          </svg>
          {ricoveriAttivi.size > 0 && (
            <i className="absolute right-1.5 top-1.5 block h-2 w-2 rounded-full" style={{ background: "var(--color-brand)" }} />
          )}
        </button>
        {ordinamenti.length > 1 && (
          <select
            value={ordine}
            onChange={(e) => setOrdine(e.target.value as Ordinamento)}
            className="h-12 shrink-0 rounded-full border border-black/[.16] bg-white px-2 text-sm text-[#201e1d]"
          >
            {ordinamenti.map((o) => (
              <option key={o} value={o}>
                {ETICHETTA_ORDINE[o]}
              </option>
            ))}
          </select>
        )}
      </div>

      {filtriAperti && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {RICOVERI.map((r) => {
            const attivo = ricoveriAttivi.has(r);
            const colore = COLORE_RICOVERO[r];
            return (
              <button
                key={r}
                type="button"
                onClick={() => alternaRicovero(r)}
                className="rounded-full px-3 py-1.5 font-sans text-xs font-bold tracking-wide"
                style={{
                  background: attivo ? colore.bg : "var(--color-neutral-100)",
                  color: attivo ? (colore.testoChiaro ? "#fff" : "var(--color-text)") : "var(--color-text-secondary)",
                }}
              >
                {r}
              </button>
            );
          })}
        </div>
      )}

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
