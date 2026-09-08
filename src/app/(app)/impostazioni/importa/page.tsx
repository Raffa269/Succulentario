import Link from "next/link";
import { ModuloImportazione } from "@/components/modulo-importazione";

export const metadata = { title: "Importa backup · Succulentario" };

export default function PaginaImportazione() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-3">
      <Link
        href="/impostazioni"
        className="mb-2 flex h-11 w-fit items-center gap-2 font-sans text-[15px] font-bold"
        style={{ color: "var(--color-brand)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth={3} strokeLinecap="round" aria-hidden="true">
          <path d="M14 6l-6 6 6 6" />
        </svg>
        Menu
      </Link>
      <h1 className="font-heading text-2xl text-[var(--color-text)]">Importa backup</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        Carica il backup esportato dal vecchio artifact: il file .json, oppure la pagina .html con le
        foto incorporate. Le varietà si riagganciano al catalogo automaticamente, anche se la chiave è
        cambiata.
      </p>
      <ModuloImportazione />
    </div>
  );
}
