import Link from "next/link";

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
            Carica il backup esportato dal vecchio artifact (.json o .html).
          </p>
        </Link>
      </div>
    </div>
  );
}
