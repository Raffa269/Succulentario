import { getVarietaByKey, type Ricovero } from "@/lib/catalogo";
import type { Plant } from "@/lib/plants";

type Segmento = Ricovero | "senza-scheda";

const ETICHETTA: Record<Segmento, string> = {
  fuori: "fuori",
  riparo: "riparo",
  casa: "casa",
  "casa!": "casa!",
  "senza-scheda": "senza scheda",
};
const COLORE: Record<Segmento, string> = {
  fuori: "var(--color-fuori)",
  riparo: "var(--color-riparo)",
  casa: "var(--color-casa)",
  "casa!": "var(--color-casa-esclamativo)",
  "senza-scheda": "var(--color-neutral-300)",
};
const ORDINE: Segmento[] = ["fuori", "riparo", "casa", "casa!", "senza-scheda"];

/**
 * Card "In collezione": quante piante ci sono davvero, con barra segmentata
 * per tenere sott'occhio le proporzioni fra esigenze di ricovero. Le piante
 * non ancora collegate a una varietà catalogata contano come "senza scheda".
 */
export function CardCopertura({ piante }: { piante: Plant[] }) {
  const totale = piante.length;
  const perSegmento: Record<Segmento, number> = {
    fuori: 0,
    riparo: 0,
    casa: 0,
    "casa!": 0,
    "senza-scheda": 0,
  };

  for (const pianta of piante) {
    const ricovero = pianta.var_key ? getVarietaByKey(pianta.var_key)?.ricovero : undefined;
    perSegmento[ricovero ?? "senza-scheda"]++;
  }

  return (
    <div className="mb-3 rounded-[20px] px-4 pb-[15px] pt-3.5" style={{ background: "var(--color-neutral-100)" }}>
      <div className="mb-2.5 flex items-end justify-between gap-3">
        <div>
          <span className="font-sans text-[13px] font-bold tracking-wide">In collezione</span>
          <div className="mt-1 font-heading text-[34px] leading-none text-[var(--color-text)]" style={{ fontVariantNumeric: "tabular-nums" }}>
            {totale}
          </div>
        </div>
        <span className="pb-1 font-sans text-[13px] font-medium text-[var(--color-text-secondary)]">
          {totale === 1 ? "pianta" : "piante"}
        </span>
      </div>

      {totale > 0 ? (
        <div className="flex h-4 gap-0.5 overflow-hidden rounded-full">
          {ORDINE.map((r) =>
            perSegmento[r] > 0 ? (
              <div
                key={r}
                style={{ width: `${(perSegmento[r] / totale) * 100}%`, background: COLORE[r] }}
              />
            ) : null,
          )}
        </div>
      ) : (
        <div className="h-4 rounded-full" style={{ background: "var(--color-neutral-300)" }} />
      )}

      <div className="mt-2 flex flex-wrap gap-3 font-sans text-xs font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
        {ORDINE.map((r) => (
          <span key={r} className="flex items-center gap-1.5">
            <i className="block h-[9px] w-[9px] rounded-[3px]" style={{ background: COLORE[r] }} />
            {perSegmento[r]} {ETICHETTA[r]}
          </span>
        ))}
      </div>
    </div>
  );
}
