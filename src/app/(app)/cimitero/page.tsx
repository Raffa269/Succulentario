import { caricaPiante } from "@/lib/piante-server";
import { CimiteroCard } from "@/components/cimitero-card";
import { AppHeader } from "@/components/app-header";

export const metadata = { title: "Cimitero · Succulentario" };

export default async function PaginaCimitero() {
  const { piante } = await caricaPiante("lost");

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-3">
      <AppHeader />
      <h1 className="mb-1 font-heading text-2xl text-[var(--color-text)]">Cimitero</h1>
      <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {piante.length === 0
          ? "Nessuna pianta persa, finora."
          : `${piante.length} ${piante.length === 1 ? "pianta persa" : "piante perse"} — tocca una scheda per la causa e la lezione imparata.`}
      </p>

      <div className="flex flex-col gap-2.5">
        {piante.map((p) => (
          <CimiteroCard key={p.id} plant={p} />
        ))}
      </div>
    </div>
  );
}
