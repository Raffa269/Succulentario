"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { comprimiImmagine } from "@/lib/immagine";
import { creaManuale } from "@/app/actions/plants";
import type { Genere } from "@/lib/catalogo";
import type { PlantKind } from "@/lib/plants";

export function ModuloNuovaPianta({
  kindIniziale,
  generi,
}: {
  kindIniziale: PlantKind;
  generi: Genere[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [kind, setKind] = useState<PlantKind>(kindIniziale);
  const [anteprimaFoto, setAnteprimaFoto] = useState<string | null>(null);
  const [fileFoto, setFileFoto] = useState<File | null>(null);
  const [inviando, setInviando] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  function scegliFoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileFoto(file);
    setAnteprimaFoto(URL.createObjectURL(file));
  }

  async function invia(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setInviando(true);
    setErrore(null);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set("kind", kind);

      if (fileFoto) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Sessione scaduta: ricarica la pagina e riprova.");

        const blob = await comprimiImmagine(fileFoto);
        const percorso = `${user.id}/${crypto.randomUUID()}.jpg`;
        const { error: erroreUpload } = await supabase.storage
          .from("foto")
          .upload(percorso, blob, { contentType: "image/jpeg" });
        if (erroreUpload) throw new Error(erroreUpload.message);

        formData.set("photoPath", percorso);
      }

      const { id } = await creaManuale(formData);
      router.push(`/piante/${id}`);
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Qualcosa è andato storto.");
      setInviando(false);
    }
  }

  return (
    <form onSubmit={invia} className="mt-6 flex flex-col gap-4">
      <div className="flex rounded-lg border border-black/10 p-1">
        {(["collection", "wishlist"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className="h-9 flex-1 rounded-md text-sm font-medium"
            style={{
              backgroundColor: kind === k ? "var(--color-fuori)" : "transparent",
              color: kind === k ? "#fff" : "var(--color-text-secondary)",
            }}
          >
            {k === "collection" ? "Collezione" : "Wishlist"}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-[var(--color-text-secondary)]">Foto</span>
        <input type="file" accept="image/*" capture="environment" onChange={scegliFoto} className="text-sm" />
        {anteprimaFoto && (
          <Image
            src={anteprimaFoto}
            alt="Anteprima"
            width={160}
            height={160}
            unoptimized
            className="mt-2 h-40 w-40 rounded-lg object-cover"
          />
        )}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-[var(--color-text-secondary)]">Nome</span>
        <input
          name="name"
          required
          className="h-11 rounded-lg border border-black/10 bg-[var(--color-surface)] px-3 text-base text-[var(--color-text)] outline-none focus:border-[var(--color-fuori)]"
          placeholder="Es. Echeveria elegans"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-[var(--color-text-secondary)]">Genere (facoltativo)</span>
        <select
          name="genusId"
          defaultValue=""
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

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-[var(--color-text-secondary)]">Note</span>
        <textarea
          name="notes"
          rows={3}
          className="rounded-lg border border-black/10 bg-[var(--color-surface)] p-3 text-base text-[var(--color-text)] outline-none focus:border-[var(--color-fuori)]"
        />
      </label>

      {errore && <p className="text-sm text-[var(--color-casa-esclamativo)]">{errore}</p>}

      <button
        type="submit"
        disabled={inviando}
        className="h-11 rounded-lg bg-[var(--color-fuori)] font-medium text-white disabled:opacity-60"
      >
        {inviando ? "Salvo…" : "Salva"}
      </button>
    </form>
  );
}
