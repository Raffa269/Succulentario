import { AppHeader } from "@/components/app-header";
import { createClient } from "@/lib/supabase/server";
import { aggiungiIntervento, eliminaIntervento } from "@/app/actions/calendar";
import {
  ETICHETTA_INTERVENTO,
  ICONA_INTERVENTO,
  TIPI_INTERVENTO,
  type InterventoCalendario,
  type TipoIntervento,
} from "@/lib/calendario-interventi";

export const metadata = { title: "Calendario · Succulentario" };
export const dynamic = "force-dynamic";

const NOMI_MESE = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
];

const GIORNI_SETTIMANA = ["lun", "mar", "mer", "gio", "ven", "sab", "dom"];

function meseDaParametro(mese?: string | string[]) {
  const valore = Array.isArray(mese) ? mese[0] : mese;
  const match = valore?.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    const oggi = new Date();
    return { anno: oggi.getFullYear(), mese: oggi.getMonth() };
  }
  const anno = Number(match[1]);
  const meseIndex = Number(match[2]) - 1;
  if (!Number.isFinite(anno) || meseIndex < 0 || meseIndex > 11) {
    const oggi = new Date();
    return { anno: oggi.getFullYear(), mese: oggi.getMonth() };
  }
  return { anno, mese: meseIndex };
}

function chiaveMese(anno: number, mese: number) {
  return `${anno}-${String(mese + 1).padStart(2, "0")}`;
}

function spostaMese(anno: number, mese: number, delta: number) {
  const data = new Date(anno, mese + delta, 1);
  return chiaveMese(data.getFullYear(), data.getMonth());
}

function dataDefault(anno: number, mese: number) {
  const oggi = new Date();
  if (oggi.getFullYear() === anno && oggi.getMonth() === mese) return oggi.toISOString().slice(0, 10);
  return `${chiaveMese(anno, mese)}-01`;
}

function dataIso(data: Date) {
  return data.toISOString().slice(0, 10);
}

function formattaDataBreve(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function giorniDelMese(anno: number, mese: number) {
  const totale = new Date(anno, mese + 1, 0).getDate();
  const primoGiorno = new Date(anno, mese, 1).getDay();
  const vuotiIniziali = (primoGiorno + 6) % 7;
  return [
    ...Array.from({ length: vuotiIniziali }, () => null),
    ...Array.from({ length: totale }, (_, index) => index + 1),
  ];
}

function gruppoPerGiorno(interventi: InterventoCalendario[]) {
  const gruppi = new Map<string, InterventoCalendario[]>();
  for (const intervento of interventi) {
    const voci = gruppi.get(intervento.event_date) ?? [];
    voci.push(intervento);
    gruppi.set(intervento.event_date, voci);
  }
  return gruppi;
}

function IconaTipo({ tipo }: { tipo: TipoIntervento }) {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-sans text-sm font-bold"
      style={{ background: "var(--color-neutral-200)", color: "var(--color-brand)" }}
      aria-hidden="true"
    >
      {ICONA_INTERVENTO[tipo]}
    </span>
  );
}

export default async function PaginaCalendario({
  searchParams,
}: {
  searchParams?: Promise<{ mese?: string | string[] }>;
}) {
  const params = await searchParams;
  const { anno, mese } = meseDaParametro(params?.mese);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const meseCorrente = chiaveMese(anno, mese);
  const inizio = `${meseCorrente}-01`;
  const fineData = new Date(anno, mese + 1, 1);
  const fine = `${chiaveMese(fineData.getFullYear(), fineData.getMonth())}-01`;
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("owner", user!.id)
    .gte("event_date", inizio)
    .lt("event_date", fine)
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false });

  const oggi = new Date();
  const dodiciMesiFa = new Date(oggi);
  dodiciMesiFa.setMonth(dodiciMesiFa.getMonth() - 12);
  const { data: storicoData, error: storicoError } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("owner", user!.id)
    .gte("event_date", dataIso(dodiciMesiFa))
    .lte("event_date", dataIso(oggi))
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false });

  const tabellaAssente = error?.message.toLowerCase().includes("calendar_events");
  const interventi = error ? [] : ((data ?? []) as InterventoCalendario[]);
  const storicoInterventi = error || storicoError ? [] : ((storicoData ?? []) as InterventoCalendario[]);
  const perGiorno = gruppoPerGiorno(interventi);
  const celle = giorniDelMese(anno, mese);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-3">
      <AppHeader />
      <h1 className="mb-1 font-heading text-2xl text-[var(--color-text)]">Calendario</h1>
      <p className="mb-4 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
        Segna irrigazioni, fertilizzazioni, propagazioni e note libere.
      </p>

      {tabellaAssente && (
        <div className="mb-4 rounded-[20px] p-4" style={{ background: "var(--color-casa-tinta)" }}>
          <p className="font-sans text-[15px] font-bold text-[var(--color-text)]">Database da aggiornare</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text)]">
            La tabella del calendario non è ancora presente su Supabase. Applica la migrazione
            <span className="font-mono"> 0006_calendar_events.sql</span>, poi questa pagina inizierà
            a salvare gli interventi.
          </p>
        </div>
      )}

      <section className="mb-4 rounded-[20px] p-4" style={{ background: "var(--color-neutral-100)" }}>
        <form action={aggiungiIntervento} className="grid grid-cols-2 gap-2">
          <input
            type="date"
            name="eventDate"
            defaultValue={dataDefault(anno, mese)}
            className="h-11 rounded-xl bg-white px-3 text-sm text-[var(--color-text)]"
            style={{ border: "1px solid var(--color-divider)" }}
            disabled={!!tabellaAssente}
          />
          <select
            name="kind"
            defaultValue="irrigazione"
            className="h-11 rounded-xl bg-white px-3 text-sm text-[var(--color-text)]"
            style={{ border: "1px solid var(--color-divider)" }}
            disabled={!!tabellaAssente}
          >
            {TIPI_INTERVENTO.map((tipo) => (
              <option key={tipo} value={tipo}>
                {ICONA_INTERVENTO[tipo]} {ETICHETTA_INTERVENTO[tipo]}
              </option>
            ))}
          </select>
          <input
            name="note"
            placeholder="Nota libera"
            className="col-span-2 h-11 rounded-xl bg-white px-3 text-sm text-[var(--color-text)]"
            style={{ border: "1px solid var(--color-divider)" }}
            disabled={!!tabellaAssente}
          />
          <button
            type="submit"
            disabled={!!tabellaAssente}
            className="col-span-2 h-11 rounded-xl font-heading text-sm text-white disabled:opacity-50"
            style={{ background: "var(--color-brand)" }}
          >
            Aggiungi intervento
          </button>
        </form>
      </section>

      <section className="rounded-[20px] p-3" style={{ background: "var(--color-neutral-100)" }}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <a
            href={`/calendario?mese=${spostaMese(anno, mese, -1)}`}
            aria-label="Mese precedente"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-[var(--color-text)]"
            style={{ border: "1px solid var(--color-divider)" }}
          >
            ‹
          </a>
          <h2 className="text-center font-heading text-[22px] capitalize text-[var(--color-text)]">
            {NOMI_MESE[mese]} {anno}
          </h2>
          <a
            href={`/calendario?mese=${spostaMese(anno, mese, 1)}`}
            aria-label="Mese successivo"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-[var(--color-text)]"
            style={{ border: "1px solid var(--color-divider)" }}
          >
            ›
          </a>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {GIORNI_SETTIMANA.map((giorno) => (
            <div key={giorno} className="pb-1 text-center font-sans text-[11px] font-bold text-[var(--color-text-secondary)]">
              {giorno}
            </div>
          ))}
          {celle.map((giorno, index) => {
            if (giorno == null) return <div key={`vuoto-${index}`} className="aspect-square" />;
            const iso = `${meseCorrente}-${String(giorno).padStart(2, "0")}`;
            const voci = perGiorno.get(iso) ?? [];
            return (
              <div
                key={iso}
                className="flex aspect-square min-h-[52px] flex-col rounded-xl bg-white p-1.5"
                style={{ border: "1px solid var(--color-divider)" }}
              >
                <span className="font-sans text-xs font-bold text-[var(--color-text)]">{giorno}</span>
                {voci.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-0.5">
                    {voci.slice(0, 4).map((intervento) => (
                      <span
                        key={intervento.id}
                        title={`${ETICHETTA_INTERVENTO[intervento.kind]}${intervento.note ? `: ${intervento.note}` : ""}`}
                        aria-label={`${ETICHETTA_INTERVENTO[intervento.kind]} del ${giorno}`}
                        className="flex h-5 w-5 items-center justify-center rounded-full text-[11px]"
                        style={{ background: "var(--color-neutral-200)", color: "var(--color-brand)" }}
                      >
                        {ICONA_INTERVENTO[intervento.kind]}
                      </span>
                    ))}
                    {voci.length > 4 && (
                      <span className="text-[10px] font-bold text-[var(--color-text-secondary)]">+{voci.length - 4}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {interventi.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {interventi.map((intervento) => (
              <div key={intervento.id} className="flex items-start gap-2.5 rounded-2xl bg-white p-3">
                <IconaTipo tipo={intervento.kind} />
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-sm font-bold text-[var(--color-text)]">
                    {intervento.event_date.slice(8, 10)} · {ETICHETTA_INTERVENTO[intervento.kind]}
                  </p>
                  {intervento.note && (
                    <p className="mt-0.5 text-sm leading-relaxed text-[var(--color-text)]">{intervento.note}</p>
                  )}
                </div>
                <form action={eliminaIntervento.bind(null, intervento.id)}>
                  <button
                    type="submit"
                    aria-label="Elimina intervento"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-secondary)]"
                  >
                    ×
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      {storicoInterventi.length > 0 && (
        <section className="mt-4 pb-2">
          <p className="mb-2 font-sans text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Ultimi 12 mesi
          </p>
          <div className="flex flex-col gap-1.5">
            {storicoInterventi.map((intervento) => (
              <div
                key={intervento.id}
                className="flex items-start gap-2 font-sans text-[11px] leading-snug text-[var(--color-text-secondary)]"
              >
                <span className="w-[52px] shrink-0 tabular-nums">{formattaDataBreve(intervento.event_date)}</span>
                <span className="shrink-0" aria-hidden="true">
                  {ICONA_INTERVENTO[intervento.kind]}
                </span>
                <span>
                  {ETICHETTA_INTERVENTO[intervento.kind]}
                  {intervento.note ? ` - ${intervento.note}` : ""}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
