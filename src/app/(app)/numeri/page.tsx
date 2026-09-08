import { createClient } from "@/lib/supabase/server";
import { generi, contaCatalogo, getVarietaDiGenere } from "@/lib/catalogo";
import { caricaPiante } from "@/lib/piante-server";
import { CimiteroCard } from "@/components/cimitero-card";
import { AppHeader } from "@/components/app-header";

export const metadata = { title: "Numeri · Succulentario" };

interface RigaConteggio {
  kind: "collection" | "lost";
  genus_id: string | null;
  var_key: string | null;
  purchase_ym: string | null;
}

export default async function PaginaNumeri() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: righe }, { piante: cimitero }] = await Promise.all([
    supabase
      .from("plants")
      .select("kind, genus_id, var_key, purchase_ym")
      .eq("owner", user!.id)
      .in("kind", ["collection", "lost"]),
    caricaPiante("lost"),
  ]);

  const tutte = (righe ?? []) as RigaConteggio[];
  const collezione = tutte.filter((r) => r.kind === "collection");
  const perse = tutte.filter((r) => r.kind === "lost");

  const { totaleVarieta } = contaCatalogo();
  const varietaPossedute = new Set(collezione.map((r) => r.var_key).filter(Boolean)).size;
  const coperturaCatalogo = totaleVarieta > 0 ? Math.round((varietaPossedute / totaleVarieta) * 100) : 0;

  const totaliAcquistate = collezione.length + perse.length;
  const sopravvivenza = totaliAcquistate > 0 ? Math.round((collezione.length / totaliAcquistate) * 100) : 100;

  // Copertura per genere: varietà distinte possedute su quelle catalogate, un genere per riga.
  const coperturaGeneri = generi
    .map((g) => {
      const totaleGenere = getVarietaDiGenere(g.id).length;
      const possedute = new Set(
        collezione.filter((r) => r.genus_id === g.id).map((r) => r.var_key).filter(Boolean),
      ).size;
      return { genere: g, possedute, totaleGenere };
    })
    .filter((r) => r.totaleGenere > 0)
    .sort((a, b) => b.possedute - a.possedute || b.possedute / b.totaleGenere - a.possedute / a.totaleGenere);

  // Acquisti per anno (collezione + cimitero: sono comunque state acquistate).
  const perAnno = new Map<string, number>();
  for (const r of tutte) {
    if (!r.purchase_ym) continue;
    const anno = r.purchase_ym.slice(0, 4);
    perAnno.set(anno, (perAnno.get(anno) ?? 0) + 1);
  }
  const anniOrdinati = [...perAnno.keys()].sort();
  const massimoAnno = Math.max(1, ...perAnno.values());

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-3">
      <AppHeader />
      <h1 className="mb-4 font-heading text-2xl text-[var(--color-text)]">Numeri</h1>

      <div className="mb-4 flex gap-2.5">
        <div className="flex-1 rounded-[20px] px-4 py-[15px] text-white" style={{ background: "var(--color-brand)" }}>
          <div className="font-heading text-[34px] leading-none" style={{ fontVariantNumeric: "tabular-nums" }}>
            {collezione.length}
          </div>
          <div className="mt-[5px] font-sans text-[13px] font-medium opacity-90">
            {collezione.length === 1 ? "pianta" : "piante"} · {coperturaCatalogo}% del catalogo
          </div>
        </div>
        <div className="flex-1 rounded-[20px] px-4 py-[15px]" style={{ background: "var(--color-neutral-100)" }}>
          <div className="font-heading text-[34px] leading-none" style={{ fontVariantNumeric: "tabular-nums" }}>
            {sopravvivenza}%
          </div>
          <div className="mt-[5px] font-sans text-[13px] font-medium text-[var(--color-text-secondary)]">
            sopravvivenza
          </div>
        </div>
      </div>

      {coperturaGeneri.length > 0 && (
        <div className="mb-3.5 rounded-[20px] p-4" style={{ background: "var(--color-neutral-100)" }}>
          <p className="mb-3 font-sans text-[13px] font-bold tracking-wide">Copertura per genere</p>
          <div className="flex flex-col gap-2.5" style={{ fontVariantNumeric: "tabular-nums" }}>
            {coperturaGeneri.map(({ genere, possedute, totaleGenere }) => (
              <div key={genere.id}>
                <div className="mb-1 flex items-center justify-between font-sans text-[13px] font-medium">
                  <span>{genere.nome}</span>
                  <span className="text-[var(--color-text-secondary)]">
                    {possedute} / {totaleGenere}
                  </span>
                </div>
                <div className="h-2.5 rounded-full" style={{ background: "var(--color-neutral-300)" }}>
                  <div
                    className="h-2.5 rounded-full"
                    style={{
                      width: `${totaleGenere > 0 ? Math.min(100, (possedute / totaleGenere) * 100) : 0}%`,
                      background: "var(--color-riparo)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {anniOrdinati.length > 0 && (
        <div className="mb-3.5 rounded-[20px] p-4" style={{ background: "var(--color-neutral-100)" }}>
          <p className="mb-3.5 font-sans text-[13px] font-bold tracking-wide">Acquisti per anno</p>
          <div className="flex h-[88px] items-end gap-2.5" style={{ fontVariantNumeric: "tabular-nums" }}>
            {anniOrdinati.map((anno) => {
              const valore = perAnno.get(anno) ?? 0;
              return (
                <div key={anno} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t-lg"
                    style={{ height: `${Math.max(6, (valore / massimoAnno) * 62)}px`, background: "var(--color-brand)" }}
                    title={`${valore} nel ${anno}`}
                  />
                  <span className="font-sans text-[11px] font-medium text-[var(--color-text-secondary)]">
                    &apos;{anno.slice(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <h2 className="mb-1 mt-6 font-heading text-[22px] text-[var(--color-text)]">Cimitero</h2>
      <p className="mb-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {cimitero.length === 0
          ? "Nessuna pianta persa, finora."
          : `${cimitero.length} ${cimitero.length === 1 ? "pianta persa" : "piante perse"}. Ognuna ha insegnato qualcosa.`}
      </p>
      <div className="flex flex-col gap-2.5">
        {cimitero.map((p) => (
          <CimiteroCard key={p.id} plant={p} />
        ))}
      </div>
    </div>
  );
}
