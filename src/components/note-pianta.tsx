"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { aggiungiNotaPianta, eliminaNotaPianta, modificaNotaPianta } from "@/app/actions/plants";
import { formattaDataCompleta, type NotaPianta } from "@/lib/diario-pianta";

export function NotePianta({ plantId, note, notaPrecedente }: {
  plantId: string; note: NotaPianta[]; notaPrecedente: string;
}) {
  const router = useRouter();
  const [testo, setTesto] = useState("");
  const [occupato, setOccupato] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [notaInModifica, setNotaInModifica] = useState<string | null>(null);
  const [testoModifica, setTestoModifica] = useState("");

  async function salvaModifica(e: FormEvent, id: string) {
    e.preventDefault();
    if (occupato || !testoModifica.trim()) return;
    setOccupato(true);
    setErrore(null);
    try {
      await modificaNotaPianta(plantId, id, testoModifica);
      setNotaInModifica(null);
      router.refresh();
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Modifica della nota fallita.");
    } finally {
      setOccupato(false);
    }
  }

  async function salva(e: FormEvent) {
    e.preventDefault();
    if (occupato || !testo.trim()) return;
    setOccupato(true);
    setErrore(null);
    try {
      await aggiungiNotaPianta(plantId, testo);
      setTesto("");
      router.refresh();
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Salvataggio della nota fallito.");
    } finally {
      setOccupato(false);
    }
  }

  async function elimina(id: string) {
    if (occupato || !confirm("Eliminare questa nota?")) return;
    setOccupato(true);
    setErrore(null);
    try {
      await eliminaNotaPianta(plantId, id);
      router.refresh();
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Eliminazione della nota fallita.");
    } finally {
      setOccupato(false);
    }
  }

  const voci = [
    ...[...note].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    ...(notaPrecedente.trim() ? [{ id: "legacy", text: notaPrecedente, created_at: null, updated_at: undefined }] : []),
  ];

  return (
    <section className="mt-6" aria-labelledby="titolo-note">
      <h2 id="titolo-note" className="mb-3 font-heading text-lg">Note</h2>
      <div className="flex flex-col gap-3" aria-live="polite" aria-busy={occupato}>
        {voci.map((nota) => (
          <article key={nota.id} className="rounded-2xl bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              {nota.created_at ? (
                <time dateTime={nota.created_at} className="text-xs text-[var(--color-text-secondary)]">
                  {formattaDataCompleta(nota.created_at)}
                </time>
              ) : <p className="text-xs text-[var(--color-text-secondary)]">Nota precedente · data non disponibile</p>}
              <div className="flex shrink-0">
              <button type="button" disabled={occupato || notaInModifica !== null}
                onClick={() => { setNotaInModifica(nota.id); setTestoModifica(nota.text); setErrore(null); }}
                aria-label={`Modifica nota ${nota.created_at ? formattaDataCompleta(nota.created_at) : "precedente"}`}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--color-brand)] disabled:opacity-50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 5 4 4M4 20l5-1L20 8a2.8 2.8 0 0 0-4-4L5 15Z" />
                </svg>
              </button>
              <button type="button" onClick={() => elimina(nota.id)} disabled={occupato || notaInModifica !== null}
                aria-label={`Elimina nota ${nota.created_at ? formattaDataCompleta(nota.created_at) : "precedente"}`}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--color-casa-esclamativo)] disabled:opacity-50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
                </svg>
              </button>
              </div>
            </div>
            {nota.updated_at && <p className="mb-2 text-xs text-[var(--color-text-secondary)]">Modificata il {formattaDataCompleta(nota.updated_at)}</p>}
            {notaInModifica === nota.id ? (
              <form onSubmit={(e) => salvaModifica(e, nota.id)} className="flex flex-col gap-2">
                <label htmlFor={`modifica-${nota.id}`} className="text-sm font-bold">Modifica nota</label>
                <textarea id={`modifica-${nota.id}`} value={testoModifica} onChange={(e) => setTestoModifica(e.target.value)}
                  autoFocus rows={3} maxLength={10000} required disabled={occupato}
                  className="w-full rounded-xl p-3 text-base outline-none" style={{ border: "1.5px solid rgba(32,30,29,.16)" }} />
                <div className="flex flex-wrap gap-2">
                  <button type="submit" disabled={occupato || !testoModifica.trim()}
                    className="min-h-11 rounded-xl px-4 text-white disabled:opacity-50"
                    style={{ background: "var(--color-brand)" }}>{occupato ? "Salvo…" : "Salva modifica"}</button>
                  <button type="button" disabled={occupato} onClick={() => setNotaInModifica(null)}
                    className="min-h-11 rounded-xl px-4" style={{ border: "1.5px solid rgba(32,30,29,.16)" }}>Annulla</button>
                </div>
              </form>
            ) : <p className="whitespace-pre-wrap break-words text-base">{nota.text}</p>}
          </article>
        ))}
      </div>
      <form onSubmit={salva} className="mt-3 flex flex-col gap-2">
        <label htmlFor="nuova-nota" className="font-sans text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Nuova nota</label>
        <textarea id="nuova-nota" value={testo} onChange={(e) => setTesto(e.target.value)}
          rows={3} maxLength={10000} required disabled={occupato || notaInModifica !== null} placeholder="Scrivi un’osservazione su questa pianta…"
          className="w-full rounded-2xl bg-white p-[15px] text-base outline-none disabled:opacity-60"
          style={{ border: "1.5px solid rgba(32,30,29,.16)" }} />
        {errore && <p role="alert" className="text-sm text-[var(--color-casa-esclamativo)]">{errore}</p>}
        <button type="submit" disabled={occupato || notaInModifica !== null || !testo.trim()}
          className="h-[52px] rounded-2xl font-heading text-[15px] text-white disabled:opacity-50"
          style={{ background: "var(--color-brand)" }}>{occupato ? "Attendi…" : "Salva nota"}</button>
      </form>
    </section>
  );
}

