"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cerca } from "@/lib/catalogo";

export default function PaginaCerca() {
  const [query, setQuery] = useState("");
  const risultati = useMemo(() => cerca(query), [query]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-serif text-2xl text-[var(--color-text)]">Cerca</h1>
      <input
        type="search"
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Nome, sinonimo, genere…"
        className="mt-4 h-11 w-full rounded-lg border border-black/10 bg-[var(--color-surface)] px-3 text-base text-[var(--color-text)] outline-none focus:border-[var(--color-fuori)]"
      />

      {query.trim().length >= 2 && (
        <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
          {risultati.length === 0
            ? "Nessun risultato."
            : `${risultati.length} risultat${risultati.length === 1 ? "o" : "i"}`}
        </p>
      )}

      <ul className="mt-2 divide-y divide-black/5">
        {risultati.map((r, i) => (
          <li key={i}>
            <Link href={r.href} className="flex items-center justify-between gap-3 py-3">
              <span>
                <span className="text-[var(--color-text)]">{r.titolo}</span>
                <span className="ml-2 text-sm text-[var(--color-text-secondary)]">
                  {r.sottotitolo}
                </span>
              </span>
              <span className="shrink-0 font-mono text-xs text-[var(--color-text-secondary)]">
                {r.tipo === "genere" ? "genere" : "varietà"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
