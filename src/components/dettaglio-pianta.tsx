"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { comprimiImmagine } from "@/lib/immagine";
import {
  aggiornaPianta,
  eliminaPianta,
  promuoviACollezione,
  riportaInCollezione,
  spostaInCimitero,
} from "@/app/actions/plants";
import { IllustrazioneGenere } from "@/components/illustrazione-genere";
import type { Genere } from "@/lib/catalogo";
import type { Plant } from "@/lib/plants";

const PAGINA_PER_KIND = { collection: "/collezione", wishlist: "/wishlist", lost: "/cimitero" } as const;

export function DettaglioPianta({
  plant,
  fotoUrlIniziale,
  generi,
}: {
  plant: Plant;
  fotoUrlIniziale: string | undefined;
  generi: Genere[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(plant.name);
  const [genusId, setGenusId] = useState(plant.genus_id ?? "");
  const [purchaseYm, setPurchaseYm] = useState(plant.purchase_ym ?? "");
  const [propSoil, setPropSoil] = useState(plant.prop_soil);
  const [propHum, setPropHum] = useState(plant.prop_hum);
  const [notes, setNotes] = useState(plant.notes);
  const [photoPath, setPhotoPath] = useState(plant.photo_path);
  const [fotoUrl, setFotoUrl] = useState(fotoUrlIniziale);

  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [mostraFormPersa, setMostraFormPersa] = useState(false);
  const [lostYm, setLostYm] = useState(plant.lost_ym ?? "");
  const [cause, setCause] = useState(plant.cause ?? "");
  const [lesson, setLesson] = useState(plant.lesson ?? "");

  async function cambiaFoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrore(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessione scaduta: ricarica la pagina.");

      const blob = await comprimiImmagine(file);
      const percorso = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage
        .from("foto")
        .upload(percorso, blob, { contentType: "image/jpeg" });
      if (error) throw new Error(error.message);

      setPhotoPath(percorso);
      setFotoUrl(URL.createObjectURL(file));
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Caricamento foto fallito.");
    }
  }

  async function salva(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErrore(null);
    try {
      await aggiornaPianta(
        plant.id,
        {
          name,
          genusId: genusId || null,
          purchaseYm: purchaseYm || null,
          propSoil,
          propHum,
          notes,
          photoPath,
        },
        plant.photo_path,
      );
      router.refresh();
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Salvataggio fallito.");
    } finally {
      setSalvando(false);
    }
  }

  async function confermaPersa() {
    setSalvando(true);
    setErrore(null);
    try {
      await spostaInCimitero(plant.id, { lostYm, cause, lesson });
      router.push("/cimitero");
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Operazione fallita.");
      setSalvando(false);
    }
  }

  async function promuovi() {
    setSalvando(true);
    setErrore(null);
    try {
      await promuoviACollezione(plant.id);
      router.push("/collezione");
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Operazione fallita.");
      setSalvando(false);
    }
  }

  async function riporta() {
    setSalvando(true);
    setErrore(null);
    try {
      await riportaInCollezione(plant.id);
      router.push("/collezione");
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Operazione fallita.");
      setSalvando(false);
    }
  }

  async function elimina() {
    if (!confirm(`Eliminare "${plant.name}"? L'operazione non si può annullare.`)) return;
    setSalvando(true);
    try {
      await eliminaPianta(plant.id, photoPath);
      router.push(PAGINA_PER_KIND[plant.kind]);
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Eliminazione fallita.");
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-lg bg-[var(--color-surface)]">
        {fotoUrl ? (
          <Image src={fotoUrl} alt={name} fill unoptimized className="object-cover" />
        ) : genusId ? (
          <IllustrazioneGenere
            genereId={genusId}
            className="flex h-full w-full items-center justify-center p-10 text-[var(--color-fuori)]/50"
          />
        ) : null}
      </div>
      <label className="mt-2 block text-center text-sm text-[var(--color-fuori)]">
        {fotoUrl ? "Cambia foto" : "Aggiungi foto"}
        <input type="file" accept="image/*" capture="environment" onChange={cambiaFoto} className="hidden" />
      </label>

      <form onSubmit={salva} className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-[var(--color-text-secondary)]">Nome</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-11 rounded-lg border border-black/10 bg-[var(--color-surface)] px-3 text-base text-[var(--color-text)] outline-none focus:border-[var(--color-fuori)]"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-[var(--color-text-secondary)]">Genere</span>
          <select
            value={genusId}
            onChange={(e) => setGenusId(e.target.value)}
            className="h-11 rounded-lg border border-black/10 bg-[var(--color-surface)] px-3 text-base text-[var(--color-text)]"
          >
            <option value="">—</option>
            {generi.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nome}
              </option>
            ))}
          </select>
        </label>

        {plant.kind !== "wishlist" && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-[var(--color-text-secondary)]">Mese di acquisto</span>
            <input
              type="month"
              value={purchaseYm}
              onChange={(e) => setPurchaseYm(e.target.value)}
              className="h-11 rounded-lg border border-black/10 bg-[var(--color-surface)] px-3 text-base text-[var(--color-text)]"
            />
          </label>
        )}

        {plant.kind === "collection" && (
          <div className="flex gap-4">
            <label className="flex h-11 flex-1 items-center gap-2 rounded-lg border border-black/10 px-3 text-sm text-[var(--color-text)]">
              <input type="checkbox" checked={propSoil} onChange={(e) => setPropSoil(e.target.checked)} />
              In propagazione (terra)
            </label>
            <label className="flex h-11 flex-1 items-center gap-2 rounded-lg border border-black/10 px-3 text-sm text-[var(--color-text)]">
              <input type="checkbox" checked={propHum} onChange={(e) => setPropHum(e.target.checked)} />
              In propagazione (umidità)
            </label>
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-[var(--color-text-secondary)]">Note</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="rounded-lg border border-black/10 bg-[var(--color-surface)] p-3 text-base text-[var(--color-text)] outline-none focus:border-[var(--color-fuori)]"
          />
        </label>

        {plant.kind === "lost" && (
          <>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-[var(--color-text-secondary)]">Mese della perdita</span>
              <input
                type="month"
                value={lostYm}
                onChange={(e) => setLostYm(e.target.value)}
                className="h-11 rounded-lg border border-black/10 bg-[var(--color-surface)] px-3 text-base text-[var(--color-text)]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-[var(--color-text-secondary)]">Causa</span>
              <input
                value={cause}
                onChange={(e) => setCause(e.target.value)}
                className="h-11 rounded-lg border border-black/10 bg-[var(--color-surface)] px-3 text-base text-[var(--color-text)]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-[var(--color-text-secondary)]">Lezione imparata</span>
              <textarea
                value={lesson}
                onChange={(e) => setLesson(e.target.value)}
                rows={2}
                className="rounded-lg border border-black/10 bg-[var(--color-surface)] p-3 text-base text-[var(--color-text)]"
              />
            </label>
          </>
        )}

        {errore && <p className="text-sm text-[var(--color-casa-esclamativo)]">{errore}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="h-11 rounded-lg bg-[var(--color-fuori)] font-medium text-white disabled:opacity-60"
        >
          {salvando ? "Salvo…" : "Salva modifiche"}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-2 border-t border-black/10 pt-6">
        {plant.kind === "wishlist" && (
          <button
            onClick={promuovi}
            disabled={salvando}
            className="h-11 rounded-lg border border-[var(--color-fuori)] font-medium text-[var(--color-fuori)]"
          >
            Promuovi a collezione
          </button>
        )}

        {plant.kind === "collection" && !mostraFormPersa && (
          <button
            onClick={() => setMostraFormPersa(true)}
            className="h-11 rounded-lg border border-[var(--color-casa-esclamativo)] font-medium text-[var(--color-casa-esclamativo)]"
          >
            Segna come persa
          </button>
        )}

        {plant.kind === "collection" && mostraFormPersa && (
          <div className="rounded-lg border border-[var(--color-casa-esclamativo)]/30 bg-[var(--color-casa-esclamativo)]/10 p-4">
            <p className="font-medium text-[var(--color-text)]">Sposta al cimitero</p>
            <label className="mt-3 flex flex-col gap-1.5">
              <span className="text-sm text-[var(--color-text-secondary)]">Mese</span>
              <input
                type="month"
                value={lostYm}
                onChange={(e) => setLostYm(e.target.value)}
                className="h-11 rounded-lg border border-black/10 bg-[var(--color-surface)] px-3 text-base text-[var(--color-text)]"
              />
            </label>
            <label className="mt-3 flex flex-col gap-1.5">
              <span className="text-sm text-[var(--color-text-secondary)]">Causa</span>
              <input
                value={cause}
                onChange={(e) => setCause(e.target.value)}
                className="h-11 rounded-lg border border-black/10 bg-[var(--color-surface)] px-3 text-base text-[var(--color-text)]"
              />
            </label>
            <label className="mt-3 flex flex-col gap-1.5">
              <span className="text-sm text-[var(--color-text-secondary)]">Lezione imparata</span>
              <textarea
                value={lesson}
                onChange={(e) => setLesson(e.target.value)}
                rows={2}
                className="rounded-lg border border-black/10 bg-[var(--color-surface)] p-3 text-base text-[var(--color-text)]"
              />
            </label>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setMostraFormPersa(false)}
                className="h-10 flex-1 rounded-lg border border-black/10 text-sm text-[var(--color-text-secondary)]"
              >
                Annulla
              </button>
              <button
                onClick={confermaPersa}
                disabled={salvando}
                className="h-10 flex-1 rounded-lg bg-[var(--color-casa-esclamativo)] text-sm font-medium text-white disabled:opacity-60"
              >
                Conferma
              </button>
            </div>
          </div>
        )}

        {plant.kind === "lost" && (
          <button
            onClick={riporta}
            disabled={salvando}
            className="h-11 rounded-lg border border-[var(--color-fuori)] font-medium text-[var(--color-fuori)]"
          >
            Riporta in collezione
          </button>
        )}

        <button
          onClick={elimina}
          disabled={salvando}
          className="h-11 rounded-lg text-sm text-[var(--color-text-secondary)] underline underline-offset-2"
        >
          Elimina
        </button>
      </div>
    </div>
  );
}
