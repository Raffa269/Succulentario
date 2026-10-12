"use client";

import { useMemo, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CAPOLUOGHI_PROVINCIA,
  CLIMA_ROMA_DEFAULT,
  COOKIE_CITTA,
  getCittaClimatica,
  normalizzaTesto,
  type CittaClimatica,
} from "@/lib/clima";

function leggiCookie(nome: string): string | undefined {
  const parti = document.cookie.split(";").map((p) => p.trim());
  const trovato = parti.find((p) => p.startsWith(`${nome}=`));
  return trovato ? decodeURIComponent(trovato.split("=").slice(1).join("=")) : undefined;
}

function sottoscriviCookie() {
  return () => undefined;
}

function cityIdDaCookie() {
  return getCittaClimatica(leggiCookie(COOKIE_CITTA)).id;
}

export function SelettoreCitta() {
  const router = useRouter();
  const [aperto, setAperto] = useState(false);
  const [query, setQuery] = useState("");
  const cityIdCookie = useSyncExternalStore(sottoscriviCookie, cityIdDaCookie, () => CLIMA_ROMA_DEFAULT.cityId);
  const [cityIdSelezionato, setCityIdSelezionato] = useState<string | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, startTransition] = useTransition();

  const cityId = cityIdSelezionato ?? cityIdCookie;
  const cittaCorrente = getCittaClimatica(cityId);
  const risultati = useMemo(() => {
    const q = normalizzaTesto(query);
    if (!q) return CAPOLUOGHI_PROVINCIA;
    return CAPOLUOGHI_PROVINCIA.filter((citta) => normalizzaTesto(citta.nome).includes(q));
  }, [query]);

  function seleziona(citta: CittaClimatica) {
    setErrore(null);
    startTransition(async () => {
      const res = await fetch("/api/clima/citta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityId: citta.id }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string; cityId?: string } | null;
      if (!res.ok) {
        setErrore(data?.error ?? "Non riesco a caricare le medie climatiche.");
        return;
      }
      setCityIdSelezionato(data?.cityId ?? citta.id);
      setQuery("");
      setAperto(false);
      router.refresh();
    });
  }

  return (
    <div className="relative mt-1">
      <button
        type="button"
        onClick={() => setAperto((v) => !v)}
        className="rounded-full px-3 py-1 font-sans text-xs font-bold"
        style={{ background: "#ffe46b", color: "var(--color-text)", boxShadow: "inset 0 0 0 1px rgba(32,30,29,.08)" }}
        aria-label="Cambia città per le indicazioni climatiche"
      >
        per {cittaCorrente.nome}
      </button>

      {aperto && (
        <div
          className="absolute left-0 top-8 z-30 w-[min(82vw,320px)] overflow-hidden rounded-2xl bg-white"
          style={{ boxShadow: "var(--shadow-md)" }}
        >
          <div className="p-3" style={{ borderBottom: "1px solid var(--color-divider)" }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              type="search"
              placeholder="Cerca capoluogo"
              className="h-10 w-full rounded-xl bg-[var(--color-neutral-100)] px-3 text-sm text-[var(--color-text)] outline-none"
            />
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-text-secondary)]">
              La città cambia esposizione consigliata e ricovero invernale.
            </p>
            {errore && <p className="mt-1.5 text-xs text-[var(--color-casa-esclamativo)]">{errore}</p>}
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {risultati.map((citta) => (
              <button
                key={citta.id}
                type="button"
                onClick={() => seleziona(citta)}
                disabled={inCorso}
                className="flex h-10 w-full items-center justify-between px-3 text-left text-sm disabled:opacity-60"
                style={{ color: citta.id === cityId ? "var(--color-brand)" : "var(--color-text)" }}
              >
                <span>{citta.nome}</span>
                {citta.id === cityId && <span className="font-sans text-xs font-bold">attiva</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
