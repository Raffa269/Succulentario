import Link from "next/link";
import { ModuloEsportazione } from "@/components/modulo-esportazione";

export const metadata = { title: "Impostazioni · Succulentario" };

export default function PaginaImpostazioni() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-serif text-2xl text-[var(--color-text)]">Impostazioni</h1>

      <div className="mt-5 flex flex-col gap-3">
        <Link
          href="/impostazioni/importa"
          className="rounded-lg border border-black/10 bg-[var(--color-surface)] p-4"
        >
          <p className="font-medium text-[var(--color-text)]">Importa backup</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Da un backup dell&apos;artifact (.json o .html) o da un backup di questa app.
          </p>
        </Link>

        <div className="rounded-lg border border-black/10 bg-[var(--color-surface)] p-4">
          <p className="font-medium text-[var(--color-text)]">Esporta backup</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Una pagina .html con collezione, wishlist e cimitero al completo — tutti i campi, foto
            incorporate. Riconoscibile in importazione.
          </p>
          <div className="mt-3">
            <ModuloEsportazione />
          </div>
        </div>
      </div>
    </div>
  );
}
