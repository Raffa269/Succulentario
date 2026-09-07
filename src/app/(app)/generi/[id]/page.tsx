import { notFound } from "next/navigation";
import { generi, getGenere, getVarietaDiGenere } from "@/lib/catalogo";
import { IllustrazioneGenere } from "@/components/illustrazione-genere";
import { BadgeRicovero } from "@/components/badge-ricovero";
import { creaDaVarieta } from "@/app/actions/plants";

export function generateStaticParams() {
  return generi.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: PageProps<"/generi/[id]">) {
  const { id } = await params;
  const genere = getGenere(id);
  return { title: genere ? `${genere.nome} · Succulentario` : "Succulentario" };
}

export default async function PaginaGenere({ params }: PageProps<"/generi/[id]">) {
  const { id } = await params;
  const genere = getGenere(id);
  if (!genere) notFound();

  const varieta = getVarietaDiGenere(id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center gap-4">
        <IllustrazioneGenere genereId={genere.id} className="h-20 w-20 shrink-0 text-[var(--color-fuori)]" />
        <div>
          <h1 className="font-serif text-2xl text-[var(--color-text)]">{genere.nome}</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{genere.fam}</p>
        </div>
      </div>

      <p className="mt-4 text-[var(--color-text)]">{genere.intro}</p>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{genere.totale}</p>

      <section className="mt-5 rounded-lg border border-[var(--color-casa-esclamativo)]/30 bg-[var(--color-casa-esclamativo)]/10 p-4">
        <p className="font-medium text-[var(--color-text)]">Ricovero invernale</p>
        <p className="mt-1 text-sm text-[var(--color-text)]">{genere.inverno}</p>
      </section>

      <section className="mt-5 space-y-3">
        {genere.spec.map(([etichetta, testo]) => (
          <div key={etichetta}>
            <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">
              {etichetta}
            </p>
            <p className="mt-0.5 text-[var(--color-text)]">{testo}</p>
          </div>
        ))}
      </section>

      <h2 className="mt-8 font-serif text-xl text-[var(--color-text)]">
        Varietà <span className="font-mono text-base text-[var(--color-text-secondary)]">({varieta.length})</span>
      </h2>

      <ul className="mt-3 divide-y divide-black/5">
        {varieta.map((v) => {
          const slug = v.key.split("#")[1] ?? v.key;
          return (
            <li key={v.key} id={slug} className="scroll-mt-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="font-medium italic text-[var(--color-text)]">
                  {v.nome}
                  {v.sinonimo && (
                    <span className="ml-1.5 font-sans not-italic text-sm text-[var(--color-text-secondary)]">
                      ({v.sinonimo})
                    </span>
                  )}
                </p>
                <BadgeRicovero valore={v.ricovero} />
              </div>
              {v.descrizione && (
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{v.descrizione}</p>
              )}
              <p className="mt-1 text-sm text-[var(--color-text)]">{v.note}</p>
              <div className="mt-2 flex gap-2">
                <form action={creaDaVarieta.bind(null, "collection", v.key)} className="flex-1">
                  <button
                    type="submit"
                    className="h-10 w-full rounded-lg border border-[var(--color-fuori)] text-sm font-medium text-[var(--color-fuori)]"
                  >
                    Ho questa
                  </button>
                </form>
                <form action={creaDaVarieta.bind(null, "wishlist", v.key)} className="flex-1">
                  <button
                    type="submit"
                    className="h-10 w-full rounded-lg border border-black/10 text-sm font-medium text-[var(--color-text-secondary)]"
                  >
                    La voglio
                  </button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
