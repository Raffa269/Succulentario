import { ModuloImportazione } from "@/components/modulo-importazione";

export const metadata = { title: "Importa backup · Succulentario" };

export default function PaginaImportazione() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-serif text-2xl text-[var(--color-text)]">Importa backup</h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Carica il backup esportato dal vecchio artifact: il file .json, oppure la pagina .html con le
        foto incorporate. Le varietà si riagganciano al catalogo automaticamente, anche se la chiave è
        cambiata.
      </p>
      <ModuloImportazione />
    </div>
  );
}
