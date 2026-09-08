import type { Ricovero } from "@/lib/catalogo";

const COLORE: Record<Ricovero, string> = {
  fuori: "var(--color-fuori)",
  riparo: "var(--color-riparo)",
  casa: "var(--color-casa)",
  "casa!": "var(--color-casa-esclamativo)",
};

// L'ambra di "casa" porta testo inchiostro, gli altri tre testo bianco: è la
// regola verificata nel mockup che tiene tutte e quattro sopra 4,5:1 di
// contrasto senza spegnere l'ambra (vedi anche FASCIA in plant-card.tsx).
const TESTO_CHIARO: Record<Ricovero, boolean> = {
  fuori: true,
  riparo: true,
  casa: false,
  "casa!": true,
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
 * delicata.
 */
export function BadgeRicovero({ valore }: { valore: Ricovero }) {
  return (
    <span
      className="inline-flex h-6 shrink-0 items-center rounded-full px-2.5 font-sans text-xs font-bold tracking-wide"
      style={{
        backgroundColor: COLORE[valore],
        color: TESTO_CHIARO[valore] ? "#fff" : "var(--color-text)",
      }}
    >
      {ETICHETTA[valore]}
    </span>
  );
}
