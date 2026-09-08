"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cerca } from "@/lib/catalogo";
import { AppHeader } from "@/components/app-header";

export default function PaginaCerca() {
  const [query, setQuery] = useState("");
  const risultati = useMemo(() => cerca(query), [query]);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-3">
      <AppHeader />
      <h1 className="mb-3 font-heading text-2xl text-[var(--color-text)]">Cerca</h1>

      <div
        className="flex h-12 items-center gap-2 rounded-full border border-black/[.16] bg-white px-4"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#645c50" strokeWidth={2.75} strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M16.5 16.5L21 21" />
        </svg>
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nome, sinonimo, genere…"
          className="h-full flex-1 bg-transparent text-base text-[#201e1d] outline-none placeholder:text-[#645c50]"
        />
      </div>

      {query.trim().length >= 2 && (
        <p className="mb-1 mt-3.5 font-sans text-sm font-medium text-[var(--color-text-secondary)]">
          {risultati.length === 0
            ? "Nessun risultato."
            : `${risultati.length} risultat${risultati.length === 1 ? "o" : "i"}`}
        </p>
      )}

      <div className="mt-1.5 flex flex-col gap-2">
        {risultati.map((r, i) => (
          <Link
            key={i}
            href={r.href}
            className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
            style={{ background: "var(--color-neutral-100)" }}
          >
            <span>
              <span
                className={r.tipo === "varieta" ? "font-serif text-base italic text-[var(--color-text)]" : "font-sans text-[15px] font-bold text-[var(--color-text)]"}
              >
                {r.titolo}
              </span>
              <span className="ml-2 text-sm text-[var(--color-text-secondary)]">{r.sottotitolo}</span>
            </span>
            <span className="shrink-0 rounded-full px-2.5 py-1 font-sans text-[11px] font-bold tracking-wide text-[var(--color-text-secondary)]" style={{ background: "var(--color-neutral-200)" }}>
              {r.tipo === "genere" ? "genere" : "varietà"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
