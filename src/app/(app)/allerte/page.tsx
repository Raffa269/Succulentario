import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { getGenere, voceCalendarioDelMese } from "@/lib/catalogo";
import { IllustrazioneGenere } from "@/components/illustrazione-genere";

export const metadata = { title: "Allerte · Succulentario" };
// Senza questo la pagina non legge nessuna API dinamica (niente cookie,
// niente query) e Next la congela come HTML statico al momento della
// build: il mese "corrente" resterebbe quello del giorno del deploy per
// sempre, fino al prossimo push.
export const dynamic = "force-dynamic";

const NOMI_MESE = [
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
];

/**
 * Calendario stagionale (bozza di Claude, non ancora verificata riga per
 * riga — vedi il commento su dati/calendario.json) + segnaposto per le vere
 * allerte gelo (previsioni Open-Meteo, notifica push), che restano una
 * tappa futura non ancora costruita.
 */
export default function PaginaAllerte() {
  const oggi = new Date();
  const mese = oggi.getMonth() + 1;
  const voci = voceCalendarioDelMese(mese);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-3">
      <AppHeader />
      <h1 className="mb-1 font-heading text-2xl capitalize text-[var(--color-text)]">
        Da fare a {NOMI_MESE[mese - 1]}
      </h1>
      <p className="mb-4 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
        {voci.length === 0
          ? "Nessun cambio di stagione da segnalare questo mese per le piante del catalogo."
          : "Cambi di stagione da tenere d'occhio per i generi del catalogo, mese per mese."}
      </p>

      {voci.length > 0 && (
        <div className="mb-6 flex flex-col gap-2.5">
          {voci.map((v, i) => {
            const genere = getGenere(v.genere);
            if (!genere) return null;
            return (
              <Link
                key={i}
                href={`/generi/${genere.id}`}
                className="flex gap-3 rounded-[20px] p-4"
                style={{ background: "var(--color-neutral-100)" }}
              >
                <IllustrazioneGenere
                  genereId={genere.id}
                  className="h-10 w-10 shrink-0"
                  style={{ color: "var(--color-riparo)" }}
                />
                <div>
                  <p className="font-sans text-[13px] font-medium text-[var(--color-text-secondary)]">{genere.nome}</p>
                  <p className="mt-0.5 font-heading text-lg leading-tight text-[var(--color-text)]">{v.azione}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-text)]">{v.dettaglio}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="flex items-start gap-3 rounded-[20px] p-4" style={{ background: "var(--color-riparo-tinta)" }}>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "var(--color-riparo)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.75} strokeLinecap="round" aria-hidden="true">
            <path d="M12 3v18M5 7l14 10M19 7L5 17" />
          </svg>
        </div>
        <div>
          <p className="font-sans text-[15px] font-bold text-[var(--color-text)]">Allerte gelo in arrivo</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text)]">
            Qui arriveranno anche le notifiche quando la temperatura minima prevista scende sotto
            soglia per una delle etichette di ricovero — così sai in anticipo cosa rientrare.
          </p>
        </div>
      </div>
    </div>
  );
}
