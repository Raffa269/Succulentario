import type { ReactNode } from "react";
import { NavLink } from "@/components/nav-link";
import { voceCalendarioDelMese } from "@/lib/catalogo";
import { isFreemium, plantLimit } from "@/lib/edition";
import { createClient } from "@/lib/supabase/server";

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
  calendario: (
    <svg {...iconaProps}>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M8 3v4M16 3v4M4 10h16" />
      <path d="M8 14h.01M12 14h.01M16 14h.01" />
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
/**
 * Il pallino su Allerte è calcolato qui, lato server: su questo layout
 * girano anche pagine statiche (prerenderizzate una volta al deploy, es.
 * /guida, /cerca) dove resterebbe congelato al mese della build finché non
 * si ripubblica — accettabile per un indicatore secondario come questo
 * (il contenuto vero di /allerte, che conta, è invece dinamico per scelta:
 * vedi `export const dynamic` in quella pagina).
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  let numeroPiante = 0;
  if (isFreemium) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { count } = await supabase.from("plants").select("id", { count: "exact", head: true }).eq("owner", user.id);
      numeroPiante = count ?? 0;
    }
  }
  const meseCorrente = new Date().getMonth() + 1;
  const cambiDiStagione = voceCalendarioDelMese(meseCorrente).length > 0;

  return (
    <div className="app-shell">
      <main className="app-content">
        {isFreemium && <p className="mx-4 mt-3 rounded-xl border border-black/10 px-4 py-2 text-sm" role="status">
          Piano gratuito · {numeroPiante}/{plantLimit} schede{numeroPiante >= plantLimit ? ". Limite raggiunto: elimina una scheda per aggiungerne un’altra." : ". Collezione, wishlist e cimitero condividono il limite."}
        </p>}
        {children}
      </main>

      <nav
        aria-label="Sezioni dell’app"
        className="app-navigation"
      >
        <NavLink href="/collezione" label="Collezione" icona={icone.collezione} />
        <NavLink href="/generi" label="Generi" icona={icone.generi} />
        <NavLink href="/calendario" label="Calendario" icona={icone.calendario} />
        <NavLink href="/allerte" label="Allerte" icona={icone.allerte} segnale={cambiDiStagione} />
        <NavLink href="/numeri" label="Numeri" icona={icone.numeri} />
      </nav>
    </div>
  );
}

