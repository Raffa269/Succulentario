import type { ReactNode } from "react";
import Link from "next/link";
import { NavLink } from "@/components/nav-link";
import { signOut } from "@/app/actions/auth";

const iconaProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-5 w-5",
  "aria-hidden": true,
};

const icone = {
  home: (
    <svg {...iconaProps}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9h12v-9" />
    </svg>
  ),
  generi: (
    <svg {...iconaProps}>
      <path d="M12 20V9" />
      <path d="M12 9c-2-4-6-5-8-4 0 4 3 6 8 4Z" />
      <path d="M12 9c2-4 6-5 8-4 0 4-3 6-8 4Z" />
    </svg>
  ),
  collezione: (
    <svg {...iconaProps}>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </svg>
  ),
  cerca: (
    <svg {...iconaProps}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m20 20-4.8-4.8" />
    </svg>
  ),
};

/**
 * Layout condiviso dalle pagine dell'app (autenticazione già garantita da
 * src/proxy.ts su tutto ciò che non è pubblico). Barra di navigazione in
 * basso: pensata per l'uso reale, una mano, in piedi, in terrazzo.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-black/10 px-4 py-3">
        <Link href="/" className="font-serif text-xl text-[var(--color-text)]">
          Succulentario
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="h-9 rounded-lg border border-black/10 px-3 text-sm text-[var(--color-text-secondary)]"
          >
            Esci
          </button>
        </form>
      </header>

      <main className="flex-1 pb-16">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-black/10 bg-[var(--color-surface)]">
        <NavLink href="/" label="Home" icona={icone.home} />
        <NavLink href="/collezione" label="Collezione" icona={icone.collezione} />
        <NavLink href="/generi" label="Generi" icona={icone.generi} />
        <NavLink href="/cerca" label="Cerca" icona={icone.cerca} />
      </nav>
    </div>
  );
}
