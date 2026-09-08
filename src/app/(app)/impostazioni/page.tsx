import Link from "next/link";
import { ModuloEsportazione } from "@/components/modulo-esportazione";
import { signOut } from "@/app/actions/auth";
import { AppHeader } from "@/components/app-header";

export const metadata = { title: "Impostazioni · Succulentario" };

function VoceMenu({ href, titolo, testo }: { href: string; titolo: string; testo: string }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-2xl px-4 py-3.5" style={{ background: "var(--color-neutral-100)" }}>
      <div>
        <p className="font-sans text-[15px] font-bold text-[var(--color-text)]">{titolo}</p>
        <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">{testo}</p>
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </Link>
  );
}

export default function PaginaImpostazioni() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-3">
      <AppHeader />
      <h1 className="mb-4 font-heading text-2xl text-[var(--color-text)]">Menu</h1>

      <div className="mb-5 flex flex-col gap-2">
        <VoceMenu href="/wishlist" titolo="Wishlist" testo="Le varietà che vorresti avere." />
        <VoceMenu href="/cimitero" titolo="Cimitero" testo="Le piante perse, e cosa hanno insegnato." />
        <VoceMenu href="/guida" titolo="Guida generale" testo="Luce, acqua, terriccio, calendario." />
        <VoceMenu href="/cerca" titolo="Cerca nel catalogo" testo="Le 525 varietà, per nome o genere." />
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/impostazioni/importa"
          className="rounded-2xl border border-black/10 p-4"
        >
          <p className="font-sans text-[15px] font-bold text-[var(--color-text)]">Importa backup</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Da un backup dell&apos;artifact (.json o .html) o da un backup di questa app.
          </p>
        </Link>

        <div className="rounded-2xl border border-black/10 p-4">
          <p className="font-sans text-[15px] font-bold text-[var(--color-text)]">Esporta backup</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Una pagina .html con collezione, wishlist e cimitero al completo — tutti i campi, foto
            incorporate. Riconoscibile in importazione.
          </p>
          <div className="mt-3">
            <ModuloEsportazione />
          </div>
        </div>
      </div>

      <form action={signOut} className="mt-6">
        <button
          type="submit"
          className="h-11 w-full rounded-xl border border-black/10 text-sm font-medium text-[var(--color-text-secondary)]"
        >
          Esci
        </button>
      </form>
    </div>
  );
}
