import Link from "next/link";
import { caricaPiante } from "@/lib/piante-server";
import { ElencoPiante } from "@/components/elenco-piante";

export const metadata = { title: "Collezione · Succulentario" };

export default async function PaginaCollezione() {
  const { piante, fotoUrl } = await caricaPiante("collection");

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-[var(--color-text)]">Collezione</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{piante.length} piante</p>
        </div>
        <Link
          href="/piante/nuova?kind=collection"
          className="flex h-10 items-center rounded-lg bg-[var(--color-fuori)] px-4 text-sm font-medium text-white"
        >
          + Aggiungi
        </Link>
      </div>

      <div className="mt-4">
        <ElencoPiante
          piante={piante}
          fotoUrl={fotoUrl}
          ordinamenti={["catalogo", "recenti", "nome", "genere"]}
          vuoto="Nessuna pianta ancora. Aggiungine una, o vai su un genere e tocca «Ho questa»."
        />
      </div>
    </div>
  );
}
