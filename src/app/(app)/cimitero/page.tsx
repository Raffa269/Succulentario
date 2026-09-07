import { caricaPiante } from "@/lib/piante-server";
import { ElencoPiante } from "@/components/elenco-piante";

export const metadata = { title: "Cimitero · Succulentario" };

export default async function PaginaCimitero() {
  const { piante, fotoUrl } = await caricaPiante("lost");

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-serif text-2xl text-[var(--color-text)]">Cimitero</h1>
      <p className="text-sm text-[var(--color-text-secondary)]">
        {piante.length} piante perse — tocca una scheda per la causa e la lezione imparata.
      </p>

      <div className="mt-4">
        <ElencoPiante piante={piante} fotoUrl={fotoUrl} vuoto="Nessuna pianta persa, finora." />
      </div>
    </div>
  );
}
