import Link from "next/link";
import { notFound } from "next/navigation";
import { generi, getGenere, getVarietaDiGenere, type Ricovero } from "@/lib/catalogo";
import { IllustrazioneGenere } from "@/components/illustrazione-genere";
import { SezioniVarietaGenere } from "@/components/sezioni-varieta-genere";
import { createClient } from "@/lib/supabase/server";

export function generateStaticParams() {
  return generi.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: PageProps<"/generi/[id]">) {
  const { id } = await params;
  const genere = getGenere(id);
  return { title: genere ? `${genere.nome} · Succulentario` : "Succulentario" };
}

const ORDINE: Ricovero[] = ["fuori", "riparo", "casa", "casa!"];
const TINTA: Record<Ricovero, string> = {
  fuori: "var(--color-fuori-tinta)",
  riparo: "var(--color-riparo-tinta)",
  casa: "var(--color-casa-tinta)",
  "casa!": "var(--color-casa-esclamativo-tinta)",
};
const SOLIDO: Record<Ricovero, { bg: string; testoChiaro: boolean }> = {
  fuori: { bg: "var(--color-fuori)", testoChiaro: true },
  riparo: { bg: "var(--color-riparo)", testoChiaro: true },
  casa: { bg: "var(--color-casa)", testoChiaro: false },
  "casa!": { bg: "var(--color-casa-esclamativo)", testoChiaro: true },
};
const INCHIOSTRO: Record<Ricovero, string> = {
  fuori: "#0f5c30",
  riparo: "#0d5486",
  casa: "#8a5c00",
  "casa!": "#8f2a1a",
};

export default async function PaginaGenere({ params }: PageProps<"/generi/[id]">) {
  const { id } = await params;
  const genere = getGenere(id);
  if (!genere) notFound();

  const varieta = getVarietaDiGenere(id);

  // La sezione dominante (più varietà) intona l'intestazione, come nel
  // mockup 1e (Haworthia è a dominante "riparo").
  const conteggi: Record<Ricovero, number> = { fuori: 0, riparo: 0, casa: 0, "casa!": 0 };
  for (const v of varieta) conteggi[v.ricovero]++;
  const dominante = ORDINE.reduce((migliore, r) => (conteggi[r] > conteggi[migliore] ? r : migliore), "fuori" as Ricovero);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: possedute } = await supabase
    .from("plants")
    .select("var_key")
    .eq("owner", user!.id)
    .eq("kind", "collection")
    .eq("genus_id", id);
  const varKeyPossedute = (possedute ?? []).map((p) => p.var_key).filter((k): k is string => !!k);

  return (
    <div className="pb-8">
      <div className="px-4 pb-4 pt-3" style={{ background: TINTA[dominante] }}>
        <Link
          href="/generi"
          className="mb-2 flex h-11 items-center gap-2 font-sans text-[15px] font-bold"
          style={{ color: INCHIOSTRO[dominante] }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={INCHIOSTRO[dominante]} strokeWidth={3} strokeLinecap="round" aria-hidden="true">
            <path d="M14 6l-6 6 6 6" />
          </svg>
          Generi
        </Link>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl leading-tight" style={{ color: INCHIOSTRO[dominante] }}>
              {genere.nome}
            </h1>
            <p className="mt-1 font-sans text-sm font-medium" style={{ color: INCHIOSTRO[dominante], fontVariantNumeric: "tabular-nums" }}>
              {varieta.length} {varieta.length === 1 ? "varietà" : "varietà"}
              {varKeyPossedute.length > 0 ? ` · ${varKeyPossedute.length} in collezione` : ""}
            </p>
          </div>
          <IllustrazioneGenere genereId={genere.id} className="h-[72px] w-[72px] shrink-0" style={{ color: INCHIOSTRO[dominante] }} />
        </div>
      </div>

      <div className="px-4 pt-4">
        <p className="mb-4 text-[15px] leading-relaxed text-[var(--color-text)]">{genere.intro}</p>

        <section
          className="mb-4 rounded-[22px] px-[18px] pb-4 pt-[18px]"
          style={{ background: SOLIDO[dominante].bg, color: SOLIDO[dominante].testoChiaro ? "#fff" : "var(--color-text)" }}
        >
          <p className="mb-2 font-sans text-xs font-bold uppercase tracking-wider opacity-85">Ricovero invernale</p>
          <p className="mb-2.5 font-heading text-xl leading-tight">{genere.totale}</p>
          <p className="mb-3.5 text-[15px] leading-relaxed">{genere.inverno}</p>
          <div className="flex flex-wrap gap-1.5" style={{ fontVariantNumeric: "tabular-nums" }}>
            {ORDINE.filter((r) => conteggi[r] > 0).map((r) => (
              <span
                key={r}
                className="rounded-[9px] px-2.5 py-2 font-sans text-xs font-bold"
                style={{ background: SOLIDO[r].bg, color: SOLIDO[r].testoChiaro ? "#fff" : "var(--color-text)" }}
              >
                {conteggi[r]} {r}
              </span>
            ))}
          </div>
        </section>

        <section className="mb-4 space-y-3 rounded-[20px] p-4" style={{ background: "var(--color-neutral-100)" }}>
          {genere.spec.map(([etichetta, testo]) => (
            <div key={etichetta}>
              <p className="font-sans text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                {etichetta}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-[var(--color-text)]">{testo}</p>
            </div>
          ))}
        </section>

        <div className="mb-2.5 flex items-baseline justify-between">
          <span className="font-heading text-xl">Le {varieta.length} varietà</span>
          <span className="font-sans text-xs font-medium text-[var(--color-text-secondary)]">per etichetta</span>
        </div>

        <SezioniVarietaGenere varieta={varieta} varKeyPossedute={varKeyPossedute} />
      </div>
    </div>
  );
}
