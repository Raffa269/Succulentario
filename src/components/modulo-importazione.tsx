"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { analizzaBackup, type VoceDaImportare } from "@/lib/import-backup";
import { svuotaPiante, importaVoce, fineImportazione } from "@/app/actions/import";

type Fase = "scegli" | "anteprima" | "importando" | "fatto" | "errore";
type Modalita = "unisci" | "sostituisci";

/** Data URL (JPEG già compresso dall'artifact) -> Blob pronto per lo Storage. */
function dataUrlABlob(dataUrl: string): Blob {
  const virgola = dataUrl.indexOf(",");
  const meta = dataUrl.slice(0, virgola);
  const base64 = dataUrl.slice(virgola + 1);
  const mime = /data:([^;]+)/.exec(meta)?.[1] ?? "image/jpeg";
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export function ModuloImportazione() {
  const router = useRouter();
  const supabase = createClient();

  const [fase, setFase] = useState<Fase>("scegli");
  const [voci, setVoci] = useState<VoceDaImportare[]>([]);
  const [modalita, setModalita] = useState<Modalita>("unisci");
  const [errore, setErrore] = useState<string | null>(null);
  const [progresso, setProgresso] = useState(0);

  async function scegliFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrore(null);
    try {
      const testoFile = await file.text();
      const analizzato = analizzaBackup(testoFile);
      if (analizzato.voci.length === 0) throw new Error("Il backup non contiene piante.");
      setVoci(analizzato.voci);
      setFase("anteprima");
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Non sono riuscito a leggere il file.");
    }
  }

  async function importa() {
    setFase("importando");
    setProgresso(0);
    setErrore(null);

    try {
      if (modalita === "sostituisci") {
        await svuotaPiante();
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessione scaduta: ricarica la pagina.");

      for (let i = 0; i < voci.length; i++) {
        const v = voci[i];
        let photoPath: string | null = null;

        if (v.fotoDataUrl) {
          try {
            const blob = dataUrlABlob(v.fotoDataUrl);
            const percorso = `${user.id}/${crypto.randomUUID()}.jpg`;
            const { error } = await supabase.storage
              .from("foto")
              .upload(percorso, blob, { contentType: blob.type || "image/jpeg" });
            if (!error) photoPath = percorso;
          } catch {
            // Una foto non decodificabile non deve bloccare l'import della pianta.
          }
        }

        await importaVoce(
          {
            importId: v.importId,
            kind: v.kind,
            name: v.name,
            genusId: v.genusId,
            varKey: v.varKey,
            photoPath,
            num: v.num,
            purchaseYm: v.purchaseYm,
            propSoil: v.propSoil,
            propHum: v.propHum,
            notes: v.notes,
            addedAt: v.addedAt,
            lostYm: v.lostYm,
            cause: v.cause,
            lesson: v.lesson,
          },
          modalita,
        );

        setProgresso(i + 1);
      }

      await fineImportazione();
      setFase("fatto");
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Importazione interrotta.");
      setFase("errore");
    }
  }

  if (fase === "scegli" || fase === "errore") {
    return (
      <div className="mt-4">
        <label
          className="flex h-14 cursor-pointer items-center justify-center rounded-2xl px-4 text-center font-sans text-sm font-medium text-[var(--color-text-secondary)]"
          style={{ background: "#fff", border: "2px dashed rgba(32,30,29,.28)" }}
        >
          Scegli il file di backup (.json o .html)
          <input
            type="file"
            accept=".json,.html,application/json,text/html"
            onChange={scegliFile}
            className="hidden"
          />
        </label>
        {errore && <p className="mt-3 text-sm text-[var(--color-casa-esclamativo)]">{errore}</p>}
      </div>
    );
  }

  if (fase === "anteprima") {
    const relinkFalliti = voci.filter((v) => v.relinkFallito);
    const conteggi = {
      collection: voci.filter((v) => v.kind === "collection").length,
      wishlist: voci.filter((v) => v.kind === "wishlist").length,
      lost: voci.filter((v) => v.kind === "lost").length,
      foto: voci.filter((v) => v.fotoDataUrl).length,
    };

    return (
      <div className="mt-4 flex flex-col gap-3.5">
        <div className="rounded-2xl p-4 text-sm text-[var(--color-text)]" style={{ background: "var(--color-neutral-100)" }}>
          <p>
            {conteggi.collection} in collezione, {conteggi.wishlist} in wishlist, {conteggi.lost} nel
            cimitero.
          </p>
          <p className="mt-1 text-[var(--color-text-secondary)]">{conteggi.foto} con foto da caricare.</p>
        </div>

        {relinkFalliti.length > 0 && (
          <div className="rounded-2xl p-4 text-sm" style={{ background: "var(--color-casa-tinta)" }}>
            <p className="font-sans font-bold text-[var(--color-text)]">
              {relinkFalliti.length} varietà non riconosciute nel catalogo
            </p>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              Verranno importate comunque, solo senza collegamento alla scheda:{" "}
              {relinkFalliti.map((v) => v.name).join(", ")}
            </p>
          </div>
        )}

        <div>
          <div className="flex rounded-2xl p-1" style={{ background: "var(--color-neutral-100)" }}>
            <button
              type="button"
              onClick={() => setModalita("unisci")}
              className="h-10 flex-1 rounded-xl font-sans text-sm font-bold"
              style={{
                backgroundColor: modalita === "unisci" ? "var(--color-brand)" : "transparent",
                color: modalita === "unisci" ? "#fff" : "var(--color-text-secondary)",
              }}
            >
              Unisci ai dati attuali
            </button>
            <button
              type="button"
              onClick={() => setModalita("sostituisci")}
              className="h-10 flex-1 rounded-xl font-sans text-sm font-bold"
              style={{
                backgroundColor: modalita === "sostituisci" ? "var(--color-casa-esclamativo)" : "transparent",
                color: modalita === "sostituisci" ? "#fff" : "var(--color-text-secondary)",
              }}
            >
              Sostituisci tutto
            </button>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {modalita === "unisci" ? (
              <>
                Aggiunge solo le piante nuove: quelle già importate da questo stesso file vengono
                riconosciute e aggiornate, mai duplicate. Puoi importare lo stesso backup più
                volte senza pericolo.
              </>
            ) : (
              <span style={{ color: "var(--color-casa-esclamativo)" }}>
                Cancella prima tutte le piante attuali (foto comprese) e poi importa da zero. Non
                si può annullare.
              </span>
            )}
          </p>
        </div>

        <button
          onClick={importa}
          className="h-[52px] rounded-2xl font-heading text-[15px] text-white"
          style={{ background: "var(--color-brand)" }}
        >
          Importa {voci.length} piante
        </button>
      </div>
    );
  }

  if (fase === "importando") {
    return (
      <div className="mt-10 text-center">
        <p className="text-[var(--color-text)]">Importazione in corso…</p>
        <p className="mt-1 font-sans text-sm text-[var(--color-text-secondary)]" style={{ fontVariantNumeric: "tabular-nums" }}>
          {progresso} / {voci.length}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 text-center">
      <p className="text-[var(--color-text)]">Fatto: {voci.length} piante importate.</p>
      <button
        onClick={() => router.push("/collezione")}
        className="mt-4 h-[52px] rounded-2xl px-6 font-heading text-[15px] text-white"
        style={{ background: "var(--color-brand)" }}
      >
        Vai alla collezione
      </button>
    </div>
  );
}
