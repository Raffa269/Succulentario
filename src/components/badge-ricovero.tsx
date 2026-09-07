import type { Ricovero } from "@/lib/catalogo";

const COLORE: Record<Ricovero, string> = {
  fuori: "var(--color-fuori)",
  riparo: "var(--color-riparo)",
  casa: "var(--color-casa)",
  "casa!": "var(--color-casa-esclamativo)",
};

const ETICHETTA: Record<Ricovero, string> = {
  fuori: "fuori",
  riparo: "riparo",
  casa: "casa",
  "casa!": "casa!",
};

/**
 * Il colore non è decorazione: codifica dove sverna la pianta (SPECIFICA.md
 * §5) — verde fuori tutto l'anno, blu riparo freddo, ocra in casa, rosso
 * delicata. Testo bianco su ognuno verificato sopra 4,5:1.
 */
export function BadgeRicovero({ valore }: { valore: Ricovero }) {
  return (
    <span
      className="inline-flex h-6 shrink-0 items-center rounded-full px-2.5 font-mono text-xs font-medium text-white"
      style={{ backgroundColor: COLORE[valore] }}
    >
      {ETICHETTA[valore]}
    </span>
  );
}
