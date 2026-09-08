import { AppHeader } from "@/components/app-header";

export const metadata = { title: "Allerte · Succulentario" };

/**
 * Segnaposto: le allerte gelo (previsioni Open-Meteo, notifica push quando
 * la minima scende sotto soglia per etichetta di ricovero) sono una tappa
 * futura, non ancora costruita — questa pagina esiste solo perché il nuovo
 * menu in basso (mockup 1f/1g) porta già a /allerte.
 */
export default function PaginaAllerte() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 pb-8 pt-3 text-center">
      <AppHeader />

      <div className="mt-16 flex flex-col items-center">
        <div
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "var(--color-riparo-tinta)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0d5486" strokeWidth={2.75} strokeLinecap="round" aria-hidden="true">
            <path d="M12 3v18M5 7l14 10M19 7L5 17" />
          </svg>
        </div>
        <h1 className="mb-2 font-heading text-2xl text-[var(--color-text)]">Allerte in arrivo</h1>
        <p className="max-w-xs text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
          Qui arriveranno le notifiche quando la temperatura minima prevista scende sotto soglia
          per una delle etichette di ricovero — così sai in anticipo cosa rientrare.
        </p>
      </div>
    </div>
  );
}
