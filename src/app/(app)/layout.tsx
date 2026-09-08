import type { ReactNode } from "react";
import { NavLink } from "@/components/nav-link";

const iconaProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-6 w-6",
  "aria-hidden": true,
};

const icone = {
  collezione: (
    <svg {...iconaProps}>
      <rect x="3" y="3" width="8" height="8" rx="2.5" />
      <rect x="13" y="3" width="8" height="8" rx="2.5" />
      <rect x="3" y="13" width="8" height="8" rx="2.5" />
      <rect x="13" y="13" width="8" height="8" rx="2.5" />
    </svg>
  ),
  generi: (
    <svg {...iconaProps}>
      <path d="M4 5h16M4 12h16M4 19h10" />
    </svg>
  ),
  allerte: (
    <svg {...iconaProps}>
      <path d="M12 3v18M5 7l14 10M19 7L5 17" />
    </svg>
  ),
  numeri: (
    <svg {...iconaProps}>
      <path d="M5 20V10M12 20V4M19 20v-7" />
    </svg>
  ),
};

/**
 * Layout condiviso dalle pagine dell'app (autenticazione già garantita da
 * src/proxy.ts). Barra di navigazione in basso, prugna: Collezione è la
 * schermata di apertura, non c'è più una Home separata. Ogni pagina porta
 * la propria intestazione — qui restano solo i contenuti e la barra.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-24">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-10 flex justify-around rounded-t-3xl pt-3"
        style={{ background: "var(--color-brand)", paddingBottom: "max(4px, env(safe-area-inset-bottom))" }}
      >
        <NavLink href="/collezione" label="Collezione" icona={icone.collezione} />
        <NavLink href="/generi" label="Generi" icona={icone.generi} />
        <NavLink href="/allerte" label="Allerte" icona={icone.allerte} />
        <NavLink href="/numeri" label="Numeri" icona={icone.numeri} />
      </nav>
    </div>
  );
}
