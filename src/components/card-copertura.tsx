import { contaCatalogo, copertura, type Ricovero } from "@/lib/catalogo";

const ETICHETTA: Record<Ricovero, string> = {
  fuori: "fuori",
  riparo: "riparo",
  casa: "casa",
  "casa!": "casa!",
};
const COLORE: Record<Ricovero, string> = {
  fuori: "var(--color-fuori)",
  riparo: "var(--color-riparo)",
  casa: "var(--color-casa)",
  "casa!": "var(--color-casa-esclamativo)",
};
const ORDINE: Ricovero[] = ["fuori", "riparo", "casa", "casa!"];

/**
 * Card "In collezione" della home (mockup 1a): quante delle 525 varietà
 * catalogate sono possedute, con barra segmentata e legenda per ricovero.
 */
export function CardCopertura({ varKeys }: { varKeys: (string | null | undefined)[] }) {
  const { totaleVarieta } = contaCatalogo();
  const { totale, perRicovero } = copertura(varKeys);
  const percentuale = totaleVarieta > 0 ? Math.round((totale / totaleVarieta) * 100) : 0;

  return (
    <div className="mb-3 rounded-[20px] px-4 pb-[15px] pt-3.5" style={{ background: "var(--color-neutral-100)" }}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-sans text-[13px] font-bold tracking-wide">In collezione</span>
        <span
          className="font-sans text-[13px] font-medium text-[var(--color-text-secondary)]"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {totale} di {totaleVarieta} · {percentuale}%
        </span>
      </div>

      {totale > 0 && (
        <div className="flex h-4 gap-0.5 overflow-hidden rounded-full">
          {ORDINE.map((r) =>
            perRicovero[r] > 0 ? (
              <div
                key={r}
                style={{ width: `${(perRicovero[r] / totale) * 100}%`, background: COLORE[r] }}
              />
            ) : null,
          )}
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-3 font-sans text-xs font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
        {ORDINE.map((r) => (
          <span key={r} className="flex items-center gap-1.5">
            <i className="block h-[9px] w-[9px] rounded-[3px]" style={{ background: COLORE[r] }} />
            {perRicovero[r]} {ETICHETTA[r]}
          </span>
        ))}
      </div>
    </div>
  );
}
