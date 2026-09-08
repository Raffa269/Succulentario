"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { promuoviACollezione, eliminaPianta } from "@/app/actions/plants";
import { getGenere, type Ricovero } from "@/lib/catalogo";
import type { Plant } from "@/lib/plants";

const FASCIA: Record<Ricovero, { bg: string; testoChiaro: boolean }> = {
  fuori: { bg: "var(--color-fuori)", testoChiaro: true },
  riparo: { bg: "var(--color-riparo)", testoChiaro: true },
  casa: { bg: "var(--color-casa)", testoChiaro: false },
  "casa!": { bg: "var(--color-casa-esclamativo)", testoChiaro: true },
};

/** Card della wishlist (mockup 1i): fascia colorata, "Ce l'ho", cestino. */
export function WishlistCard({ plant, ricovero }: { plant: Plant; ricovero?: Ricovero }) {
  const router = useRouter();
  const [inCorso, startTransition] = useTransition();
  const [eliminazione, setEliminazione] = useState(false);
  const genere = plant.genus_id ? getGenere(plant.genus_id) : undefined;

  function ceLho() {
    startTransition(async () => {
      await promuoviACollezione(plant.id);
      router.push(`/piante/${plant.id}`);
    });
  }

  function elimina() {
    if (!confirm(`Togliere "${plant.name}" dalla wishlist?`)) return;
    setEliminazione(true);
    startTransition(async () => {
      await eliminaPianta(plant.id, plant.photo_path);
      router.refresh();
    });
  }

  return (
    <div className="overflow-hidden rounded-[20px]" style={{ background: "var(--color-neutral-100)" }}>
      {ricovero && (
        <div className="px-[15px] py-[5px]" style={{ background: FASCIA[ricovero].bg }}>
          <span
            className="font-sans text-xs font-bold tracking-wide"
            style={{ color: FASCIA[ricovero].testoChiaro ? "#fff" : "var(--color-text)" }}
          >
            {ricovero}
          </span>
        </div>
      )}
      <div className="px-[15px] pb-[14px] pt-[13px]">
        <p className="font-serif text-lg italic leading-tight text-[var(--color-text)]">{plant.name}</p>
        <p className="my-[3px] mb-[11px] font-sans text-xs font-medium text-[var(--color-text-secondary)]">
          {[genere?.nome, plant.notes].filter(Boolean).join(" · ") || "—"}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={ceLho}
            disabled={inCorso}
            className="h-12 flex-1 rounded-[14px] font-heading text-sm text-white disabled:opacity-60"
            style={{ background: "var(--color-brand)" }}
          >
            Ce l&apos;ho
          </button>
          <button
            type="button"
            onClick={elimina}
            disabled={inCorso}
            aria-label="Togli dalla wishlist"
            className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-black/[.18] disabled:opacity-60"
          >
            {eliminazione ? (
              "…"
            ) : (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth={2.75} strokeLinecap="round" aria-hidden="true">
                <path d="M5 7h14M9 7V5h6v2M8 7l1 13h6l1-13" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
