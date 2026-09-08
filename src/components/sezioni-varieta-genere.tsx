"use client";

import { useState } from "react";
import { creaDaVarieta } from "@/app/actions/plants";
import type { Ricovero, Varieta } from "@/lib/catalogo";

const ORDINE: Ricovero[] = ["fuori", "riparo", "casa", "casa!"];
const COLORE: Record<Ricovero, { bg: string; testoChiaro: boolean }> = {
  fuori: { bg: "var(--color-fuori)", testoChiaro: true },
  riparo: { bg: "var(--color-riparo)", testoChiaro: true },
  casa: { bg: "var(--color-casa)", testoChiaro: false },
  "casa!": { bg: "var(--color-casa-esclamativo)", testoChiaro: true },
};

function Freccia({ aperta, chiaro }: { aperta: boolean; chiaro: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={chiaro ? "#fff" : "var(--color-text)"}
      strokeWidth={3}
      strokeLinecap="round"
      style={{ transform: aperta ? "rotate(180deg)" : "none", transition: "transform .15s" }}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/**
 * Le varietà del genere raggruppate per etichetta di ricovero, in sezioni
 * ripiegabili colorate (mockup 1e). Ogni sezione mostra il conteggio nel
 * titolo; quelle vuote restano una riga piatta senza freccia.
 */
export function SezioniVarietaGenere({
  varieta,
  varKeyPossedute,
}: {
  varieta: Varieta[];
  varKeyPossedute: string[];
}) {
  const possedute = new Set(varKeyPossedute);
  const [aperte, setAperte] = useState<Set<Ricovero>>(new Set());

  const gruppi: Record<Ricovero, Varieta[]> = { fuori: [], riparo: [], casa: [], "casa!": [] };
  for (const v of varieta) gruppi[v.ricovero].push(v);

  function alterna(r: Ricovero) {
    setAperte((precedente) => {
      const successivo = new Set(precedente);
      if (successivo.has(r)) successivo.delete(r);
      else successivo.add(r);
      return successivo;
    });
  }

  return (
    <div>
      {ORDINE.map((r) => {
        const lista = gruppi[r];
        const colore = COLORE[r];
        const testo = colore.testoChiaro ? "#fff" : "var(--color-text)";

        if (lista.length === 0) {
          return (
            <div
              key={r}
              className="mb-2 flex items-center justify-between rounded-2xl px-4 py-[15px]"
              style={{ background: colore.bg, color: testo }}
            >
              <span className="font-sans text-[15px] font-bold">{r} · nessuna</span>
            </div>
          );
        }

        const aperta = aperte.has(r);
        return (
          <div key={r} className="mb-2 overflow-hidden rounded-2xl">
            <button
              type="button"
              onClick={() => alterna(r)}
              className="flex w-full items-center justify-between px-4 py-[15px]"
              style={{ background: colore.bg, color: testo }}
            >
              <span className="font-sans text-[15px] font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
                {r} · {lista.length} {lista.length === 1 ? "varietà" : "varietà"}
              </span>
              <Freccia aperta={aperta} chiaro={colore.testoChiaro} />
            </button>

            {aperta && (
              <div style={{ background: "var(--color-neutral-100)" }}>
                {lista.map((v) => {
                  const slug = v.key.split("#")[1] ?? v.key;
                  const inCollezione = possedute.has(v.key);
                  return (
                    <div
                      key={v.key}
                      id={slug}
                      className="scroll-mt-4 px-4 py-3.5"
                      style={{ borderBottom: "1px solid var(--color-divider)" }}
                    >
                      <p className="font-serif text-lg italic leading-tight text-[var(--color-text)]">{v.nome}</p>
                      {(v.sinonimo || inCollezione) && (
                        <p className="mt-0.5 font-sans text-xs font-medium text-[var(--color-text-secondary)]">
                          {v.sinonimo && <>sin. <span className="font-serif italic">{v.sinonimo}</span></>}
                          {v.sinonimo && inCollezione && " · "}
                          {inCollezione && "in collezione"}
                        </p>
                      )}
                      {v.descrizione && (
                        <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text)]">{v.descrizione}</p>
                      )}
                      {v.note && (
                        <p className="mt-1 text-sm leading-relaxed text-[var(--color-text)]">
                          <b>Coltivazione.</b> {v.note}
                        </p>
                      )}
                      <div className="mt-2.5 flex gap-2">
                        <form action={creaDaVarieta.bind(null, "collection", v.key)} className="flex-1">
                          <button
                            type="submit"
                            className="h-9 w-full rounded-lg border text-xs font-medium"
                            style={{ borderColor: "var(--color-fuori)", color: "var(--color-fuori)" }}
                          >
                            Ho questa
                          </button>
                        </form>
                        <form action={creaDaVarieta.bind(null, "wishlist", v.key)} className="flex-1">
                          <button
                            type="submit"
                            className="h-9 w-full rounded-lg border border-black/10 text-xs font-medium text-[var(--color-text-secondary)]"
                          >
                            La voglio
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
