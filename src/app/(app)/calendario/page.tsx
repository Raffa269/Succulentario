import { AppHeader } from "@/components/app-header";
import { createClient } from "@/lib/supabase/server";
import { aggiungiIntervento, eliminaIntervento } from "@/app/actions/calendar";
import {
  ETICHETTA_INTERVENTO,
  ICONA_INTERVENTO,
  TIPI_INTERVENTO,
  formattaGiornoMese,
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

function dataDefault(anno: number, mese: number) {
  const oggi = new Date();
  if (oggi.getFullYear() === anno && oggi.getMonth() === mese) {
    return oggi.toISOString().slice(0, 10);
  }
  return `${anno}-${String(mese + 1).padStart(2, "0")}-01`;
}

function gruppoPerMese(interventi: InterventoCalendario[]) {
  const gruppi = Array.from({ length: 12 }, () => [] as InterventoCalendario[]);
  for (const intervento of interventi) {
    const mese = Number(intervento.event_date.slice(5, 7)) - 1;
    if (mese >= 0 && mese < 12) gruppi[mese].push(intervento);
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

export default async function PaginaCalendario() {
  const oggi = new Date();
  const anno = oggi.getFullYear();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const inizio = `${anno}-01-01`;
  const fine = `${anno + 1}-01-01`;
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("owner", user!.id)
    .gte("event_date", inizio)
    .lt("event_date", fine)
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false });

  const tabellaAssente = error?.message.toLowerCase().includes("calendar_events");
  const interventi = error ? [] : ((data ?? []) as InterventoCalendario[]);
  const perMese = gruppoPerMese(interventi);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-3">
      <AppHeader />
      <h1 className="mb-1 font-heading text-2xl text-[var(--color-text)]">Calendario</h1>
      <p className="mb-4 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
        Segna irrigazioni, fertilizzazioni, propagazioni e note libere mese per mese.
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

      <div className="flex flex-col gap-3">
        {NOMI_MESE.map((nomeMese, mese) => {
          const voci = perMese[mese];
          return (
            <section
              key={nomeMese}
              className="rounded-[20px] p-4"
              style={{ background: "var(--color-neutral-100)" }}
            >
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-heading text-[22px] capitalize text-[var(--color-text)]">{nomeMese}</h2>
                <span className="font-sans text-xs font-medium text-[var(--color-text-secondary)]">
                  {voci.length === 1 ? "1 intervento" : `${voci.length} interventi`}
                </span>
              </div>

              {voci.length > 0 && (
                <div className="mb-3 flex flex-col gap-2">
                  {voci.map((intervento) => (
                    <div key={intervento.id} className="flex items-start gap-2.5 rounded-2xl bg-white p-3">
                      <IconaTipo tipo={intervento.kind} />
                      <div className="min-w-0 flex-1">
                        <p className="font-sans text-sm font-bold text-[var(--color-text)]">
                          {ETICHETTA_INTERVENTO[intervento.kind]}
                          <span className="font-medium text-[var(--color-text-secondary)]">
                            {" · "}
                            {formattaGiornoMese(intervento.event_date)}
                          </span>
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
          );
        })}
      </div>
    </div>
  );
}
