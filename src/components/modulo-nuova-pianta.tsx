"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { comprimiImmagine } from "@/lib/immagine";
import { creaManuale } from "@/app/actions/plants";
import { cercaVarietaPerNome, type Genere, type Ricovero } from "@/lib/catalogo";
import { meseCorrente, type PlantKind } from "@/lib/plants";
import type { CandidatoIdentificazione } from "@/app/api/identify/route";

const ETICHETTA_CONFIDENZA: Record<CandidatoIdentificazione["confidenza"], string> = {
  alta: "ALTA",
  media: "MEDIA",
  bassa: "BASSA",
};
const COLORE_CONFIDENZA: Record<CandidatoIdentificazione["confidenza"], { bg: string; testoChiaro: boolean }> = {
  alta: { bg: "var(--color-fuori)", testoChiaro: true },
  media: { bg: "var(--color-casa)", testoChiaro: false },
  bassa: { bg: "var(--color-neutral-300)", testoChiaro: false },
};
const COLORE_RICOVERO: Record<Ricovero, { bg: string; testoChiaro: boolean }> = {
  fuori: { bg: "var(--color-fuori)", testoChiaro: true },
  riparo: { bg: "var(--color-riparo)", testoChiaro: true },
  casa: { bg: "var(--color-casa)", testoChiaro: false },
  "casa!": { bg: "var(--color-casa-esclamativo)", testoChiaro: true },
};

export function ModuloNuovaPianta({
  kindIniziale,
  generi,
  varKeyPossedute = [],
}: {
  kindIniziale: PlantKind;
  generi: Genere[];
  /** var_key già presenti in collezione: avvisa (senza bloccare) se se ne sceglie una uguale. */
  varKeyPossedute?: string[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const kind = kindIniziale;

  const inputScatta = useRef<HTMLInputElement>(null);
  const inputGalleria = useRef<HTMLInputElement>(null);
  const inputIdentifica = useRef<HTMLInputElement>(null);
  const inputNome = useRef<HTMLInputElement>(null);

  const [anteprimaFoto, setAnteprimaFoto] = useState<string | null>(null);
  const [fileFoto, setFileFoto] = useState<File | null>(null);
  const [inviando, setInviando] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [genusId, setGenusId] = useState("");
  const [varKey, setVarKey] = useState("");
  const [purchaseYm, setPurchaseYm] = useState(meseCorrente());
  const [propSoil, setPropSoil] = useState(false);
  const [propHum, setPropHum] = useState(false);
  const [note, setNote] = useState("");
  const [suggerimentiAperti, setSuggerimentiAperti] = useState(false);

  const [identificando, setIdentificando] = useState(false);
  const [erroreIdentifica, setErroreIdentifica] = useState<string | null>(null);
  const [candidati, setCandidati] = useState<CandidatoIdentificazione[] | null>(null);

  const suggerimenti = suggerimentiAperti ? cercaVarietaPerNome(nome) : [];
  const varietaGiaInCollezione = kind === "collection" && !!varKey && varKeyPossedute.includes(varKey);

  function scegliFoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileFoto(file);
    setAnteprimaFoto(URL.createObjectURL(file));
    setCandidati(null);
    setErroreIdentifica(null);
  }

  async function identificaDaFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileFoto(file);
    setAnteprimaFoto(URL.createObjectURL(file));
    setCandidati(null);
    setIdentificando(true);
    setErroreIdentifica(null);

    try {
      const blob = await comprimiImmagine(file);
      const formData = new FormData();
      formData.set("foto", blob, "foto.jpg");

      const res = await fetch("/api/identify", { method: "POST", body: formData });
      const dati = await res.json();
      if (!res.ok) throw new Error(dati.error ?? "Identificazione fallita.");

      setCandidati(dati.candidati ?? []);
    } catch (err) {
      setErroreIdentifica(err instanceof Error ? err.message : "Identificazione fallita.");
    } finally {
      setIdentificando(false);
    }
  }

  function nonSoIlNome() {
    setCandidati(null);
    inputNome.current?.focus();
  }

  function scegliVarieta(v: ReturnType<typeof cercaVarietaPerNome>[number]) {
    setNome(v.nome);
    setGenusId(v.genere);
    setVarKey(v.key);
    setSuggerimentiAperti(false);
  }

  function scegliCandidato(c: CandidatoIdentificazione) {
    setNome(c.nome);
    if (c.genusId) setGenusId(c.genusId);
    setVarKey(c.varKey ?? "");
  }

  async function invia(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!nome.trim()) {
      setErrore("Il nome è obbligatorio.");
      inputNome.current?.focus();
      return;
    }
    setInviando(true);
    setErrore(null);

    try {
      const formData = new FormData();
      formData.set("kind", kind);
      formData.set("name", nome.trim());
      formData.set("genusId", genusId);
      formData.set("varKey", varKey);
      formData.set("purchaseYm", purchaseYm);
      formData.set("propSoil", propSoil ? "1" : "0");
      formData.set("propHum", propHum ? "1" : "0");
      formData.set("notes", note);

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

  const etichettaLista = kind === "wishlist" ? "/wishlist" : "/collezione";

  return (
    <form onSubmit={invia} className="px-4 pb-10 pt-3">
      <input ref={inputScatta} type="file" accept="image/*" capture="environment" onChange={scegliFoto} className="hidden" />
      <input ref={inputGalleria} type="file" accept="image/*" onChange={scegliFoto} className="hidden" />
      {/* Niente `capture`: deve restare la scelta fra scattare e pescare dalla galleria (il selettore nativo la offre di suo). */}
      <input ref={inputIdentifica} type="file" accept="image/*" onChange={identificaDaFile} className="hidden" />

      <div className="mb-2 flex h-12 items-center justify-between">
        <Link href={etichettaLista} className="font-sans text-base font-bold" style={{ color: "var(--color-brand)" }}>
          Annulla
        </Link>
        <span className="font-heading text-[19px] text-[var(--color-text)]">Nuova pianta</span>
        <button
          type="submit"
          disabled={inviando}
          className="font-sans text-base font-bold disabled:opacity-40"
          style={{ color: nome.trim() ? "var(--color-brand)" : "rgba(32,30,29,.35)" }}
        >
          {inviando ? "Salvo…" : "Salva"}
        </button>
      </div>

      <p className="mb-1.5 mt-2.5 font-sans text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
        Nome
      </p>
      <div className="relative">
        <input
          ref={inputNome}
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            setVarKey("");
            setSuggerimentiAperti(true);
          }}
          onFocus={() => setSuggerimentiAperti(true)}
          onBlur={() => setTimeout(() => setSuggerimentiAperti(false), 150)}
          placeholder="Es. Echeveria elegans"
          className="h-[52px] w-full rounded-2xl bg-white px-[15px] text-[17px] text-[var(--color-text)] outline-none"
          style={{ border: "2px solid var(--color-brand)" }}
        />
        {suggerimentiAperti && suggerimenti.length > 0 && (
          <div
            className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-2xl bg-white"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            {suggerimenti.map((v, i) => (
              <button
                key={v.key}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => scegliVarieta(v)}
                className="flex w-full items-center gap-2.5 px-[15px] py-3.5 text-left"
                style={{ borderBottom: i < suggerimenti.length - 1 ? "1px solid var(--color-divider)" : undefined }}
              >
                <i className="block h-[26px] w-[10px] shrink-0 rounded" style={{ background: COLORE_RICOVERO[v.ricovero].bg }} />
                <span className="font-serif text-[17px] italic text-[var(--color-text)]">{v.nome}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {varietaGiaInCollezione && (
        <div
          className="mt-2.5 flex gap-2.5 rounded-2xl p-3.5"
          style={{ background: "var(--color-casa-esclamativo-tinta)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-casa-esclamativo)" strokeWidth={2.5} strokeLinecap="round" className="mt-0.5 shrink-0" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          <p className="text-sm leading-relaxed text-[var(--color-text)]">
            Hai già questa varietà in collezione. Puoi aggiungerla comunque — comparirà con
            l&apos;etichetta <b>doppio</b> sulle schede, per tenerle d&apos;occhio.
          </p>
        </div>
      )}

      <div className="mt-4 flex gap-2.5">
        <button
          type="button"
          onClick={() => inputIdentifica.current?.click()}
          disabled={identificando}
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl text-white disabled:opacity-70"
          style={{ background: "var(--color-brand)" }}
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.75} strokeLinecap="round" aria-hidden="true">
            <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
          <span className="font-heading text-[15px]">{identificando ? "Riconosco…" : "Identifica"}</span>
        </button>
        <button
          type="button"
          onClick={nonSoIlNome}
          className="h-14 flex-1 rounded-2xl font-heading text-[15px]"
          style={{ border: "2px solid var(--color-brand)", color: "var(--color-brand)" }}
        >
          Non so il nome
        </button>
      </div>

      {erroreIdentifica && <p className="mt-2.5 text-sm text-[var(--color-casa-esclamativo)]">{erroreIdentifica}</p>}

      {candidati && candidati.length === 0 && (
        <p className="mt-2.5 text-sm text-[var(--color-text-secondary)]">
          Nessun candidato plausibile. Prova con una foto più nitida, o compila a mano.
        </p>
      )}

      {candidati && candidati.length > 0 && (
        <div className="mt-4">
          <p className="mb-2.5 font-heading text-lg text-[var(--color-text)]">Tre possibilità</p>
          <p className="mb-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Proposte, non diagnosi. Tocca quella giusta, o resta sul nome scritto a mano.
          </p>
          <div className="flex flex-col gap-2.5">
            {candidati.map((c, i) => {
              const conf = COLORE_CONFIDENZA[c.confidenza];
              const ricovero = c.genusId
                ? generi.find((g) => g.id === c.genusId)
                : undefined;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => scegliCandidato(c)}
                  className="rounded-[20px] bg-white p-4 text-left"
                  style={{ outline: nome === c.nome ? "2px solid var(--color-brand)" : undefined }}
                >
                  <div className="mb-2 flex items-center justify-between gap-2.5">
                    <span className="font-serif text-[19px] italic leading-tight text-[var(--color-text)]">{c.nome}</span>
                    <span
                      className="shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 font-sans text-[11px] font-bold"
                      style={{ background: conf.bg, color: conf.testoChiaro ? "#fff" : "var(--color-text)" }}
                    >
                      {ETICHETTA_CONFIDENZA[c.confidenza]}
                    </span>
                  </div>
                  <p className="mb-2.5 text-sm leading-relaxed text-[var(--color-text)]">{c.motivo}</p>
                  {ricovero && (
                    <span className="font-sans text-xs font-medium text-[var(--color-text-secondary)]">{ricovero.nome}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2.5">
        <label className="flex-1">
          <span className="mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Genere
          </span>
          <select
            value={genusId}
            onChange={(e) => setGenusId(e.target.value)}
            className="h-[52px] w-full rounded-2xl bg-white px-[15px] text-[17px] text-[var(--color-text)]"
            style={{ border: "1.5px solid rgba(32,30,29,.16)" }}
          >
            <option value="">—</option>
            {generi.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="w-[150px]">
          <span className="mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Acquisto
          </span>
          <input
            type="month"
            value={purchaseYm}
            onChange={(e) => setPurchaseYm(e.target.value)}
            className="h-[52px] w-full rounded-2xl bg-white px-[15px] text-[17px] text-[var(--color-text)]"
            style={{ border: "1.5px solid rgba(32,30,29,.16)" }}
          />
        </label>
      </div>

      <p className="mb-1.5 mt-4 font-sans text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
        Foto
      </p>
      {anteprimaFoto ? (
        <div className="relative h-[104px] w-[104px]">
          <Image src={anteprimaFoto} alt="Anteprima" fill unoptimized className="rounded-[18px] object-cover" />
          <button
            type="button"
            onClick={() => {
              setAnteprimaFoto(null);
              setFileFoto(null);
            }}
            aria-label="Rimuovi foto"
            className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[var(--color-text)]"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            ×
          </button>
        </div>
      ) : (
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => inputScatta.current?.click()}
            className="flex h-[104px] w-[104px] flex-col items-center justify-center gap-1.5 rounded-[18px]"
            style={{ background: "var(--color-neutral-200)", border: "2px dashed rgba(32,30,29,.28)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#645c50" strokeWidth={2.75} strokeLinecap="round" aria-hidden="true">
              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            <span className="font-sans text-[11px] font-bold text-[var(--color-text-secondary)]">Scatta</span>
          </button>
          <button
            type="button"
            onClick={() => inputGalleria.current?.click()}
            className="flex h-[104px] w-[104px] flex-col items-center justify-center gap-1.5 rounded-[18px]"
            style={{ background: "var(--color-neutral-200)", border: "2px dashed rgba(32,30,29,.28)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#645c50" strokeWidth={2.75} strokeLinecap="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="M7 15l3-3 4 4 2-2 2 2" />
            </svg>
            <span className="font-sans text-[11px] font-bold text-[var(--color-text-secondary)]">Galleria</span>
          </button>
        </div>
      )}

      <p className="mb-1.5 mt-4 font-sans text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
        Propagazione
      </p>
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={() => setPropSoil((v) => !v)}
          className="flex h-[52px] flex-1 items-center gap-2.5 rounded-2xl px-3.5"
          style={
            propSoil
              ? { background: "var(--color-fuori)", color: "#fff" }
              : { background: "#fff", border: "1.5px solid rgba(32,30,29,.16)", color: "var(--color-text-secondary)" }
          }
        >
          {propSoil ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" aria-hidden="true">
              <path d="M4 12l5 5 11-11" />
            </svg>
          ) : (
            <i className="block h-5 w-5 rounded-md" style={{ border: "2px solid rgba(32,30,29,.3)" }} />
          )}
          <span className="font-sans text-sm font-bold">In terra</span>
        </button>
        <button
          type="button"
          onClick={() => setPropHum((v) => !v)}
          className="flex h-[52px] flex-1 items-center gap-2.5 rounded-2xl px-3.5"
          style={
            propHum
              ? { background: "var(--color-fuori)", color: "#fff" }
              : { background: "#fff", border: "1.5px solid rgba(32,30,29,.16)", color: "var(--color-text-secondary)" }
          }
        >
          {propHum ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" aria-hidden="true">
              <path d="M4 12l5 5 11-11" />
            </svg>
          ) : (
            <i className="block h-5 w-5 rounded-md" style={{ border: "2px solid rgba(32,30,29,.3)" }} />
          )}
          <span className="font-sans text-sm font-bold">Per umidità</span>
        </button>
      </div>

      <p className="mb-1.5 mt-4 font-sans text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
        Note
      </p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="Presa al mercato di via Trieste."
        className="w-full rounded-2xl bg-white p-[15px] text-base text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]"
        style={{ border: "1.5px solid rgba(32,30,29,.16)" }}
      />

      {errore && <p className="mt-3 text-sm text-[var(--color-casa-esclamativo)]">{errore}</p>}
    </form>
  );
}
