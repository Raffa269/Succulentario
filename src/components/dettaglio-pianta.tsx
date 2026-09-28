"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { comprimiImmagine } from "@/lib/immagine";
import {
  aggiornaPianta,
  aggiungiFotoCrescita,
  eliminaFotoCrescita,
  eliminaPianta,
  promuoviACollezione,
  riportaInCollezione,
  spostaInCimitero,
} from "@/app/actions/plants";
import { IllustrazioneGenere } from "@/components/illustrazione-genere";
import type { Genere } from "@/lib/catalogo";
import { formattaMeseAnnoDaData, type Plant, type PlantPhoto } from "@/lib/plants";
import { indicazioniPerPianta, type Esposizione, type Terriccio } from "@/lib/coltivazione";

const PAGINA_PER_KIND = { collection: "/collezione", wishlist: "/wishlist", lost: "/cimitero" } as const;
const BORDO_CAMPO = "1.5px solid rgba(32,30,29,.16)";

function Etichetta({ children }: { children: string }) {
  return (
    <span className="mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
      {children}
    </span>
  );
}

const classeCampo =
  "h-[52px] w-full rounded-2xl bg-white px-[15px] text-[17px] text-[var(--color-text)] outline-none";
const classeArea =
  "w-full rounded-2xl bg-white p-[15px] text-base text-[var(--color-text)] outline-none";

const OPZIONI_CAUSA = ["Marciume", "Poca acqua", "Troppo sole", "Venduta", "Non saprei"];

function IconaEsposizione({ valore }: { valore: Esposizione }) {
  if (valore === "sole pieno") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="12" r="4" fill="currentColor" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }
  if (valore === "mezzo sole") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M12 4a8 8 0 1 0 0 16Z" fill="currentColor" />
        <path d="M12 4a8 8 0 0 1 0 16M12 1.8v2.4M12 19.8v2.4M1.8 12h2.4M19.8 12h2.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M5 18h14a7 7 0 0 0-14 0Z" fill="currentColor" opacity="0.28" />
      <path d="M4 18h16M8 14.5a5 5 0 0 1 8 0M3 7c3 2 6 2 9 0s6-2 9 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function IconaTerriccio({ valore }: { valore: Terriccio }) {
  const punti = valore === "meno drenante" ? 3 : valore === "normale" ? 5 : 7;
  const coordinate = [[6, 15], [10, 12], [14, 16], [18, 13], [8, 18], [13, 19], [17, 18]];
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M4 11h16l-2.2 8H6.2Z" fill="currentColor" opacity="0.22" />
      <path d="M4 11h16M6.2 19h11.6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      {coordinate.slice(0, punti).map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.1" fill="currentColor" />
      ))}
    </svg>
  );
}

/** Chip predefinite + "Altro" con campo libero, per la causa della perdita. */
function SelettoreCausa({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [modalitaAltro, setModalitaAltro] = useState(value !== "" && !OPZIONI_CAUSA.includes(value));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {OPZIONI_CAUSA.map((opzione) => (
          <button
            key={opzione}
            type="button"
            onClick={() => {
              setModalitaAltro(false);
              onChange(opzione);
            }}
            className="rounded-full px-3.5 py-2 font-sans text-sm font-medium"
            style={
              !modalitaAltro && value === opzione
                ? { background: "var(--color-casa-esclamativo)", color: "#fff" }
                : { background: "#fff", border: BORDO_CAMPO, color: "var(--color-text-secondary)" }
            }
          >
            {opzione}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setModalitaAltro(true);
            onChange("");
          }}
          className="rounded-full px-3.5 py-2 font-sans text-sm font-medium"
          style={
            modalitaAltro
              ? { background: "var(--color-casa-esclamativo)", color: "#fff" }
              : { background: "#fff", border: BORDO_CAMPO, color: "var(--color-text-secondary)" }
          }
        >
          Altro
        </button>
      </div>
      {modalitaAltro && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Scrivi la causa…"
          autoFocus
          className={`${classeCampo} mt-2`}
          style={{ border: BORDO_CAMPO }}
        />
      )}
    </div>
  );
}

/** Striscia di foto datate per seguire la crescita nel tempo (non tocca la foto di copertina). */
function GalleriaCrescita({
  plantId,
  foto,
  fotoUrl,
}: {
  plantId: string;
  foto: PlantPhoto[];
  fotoUrl: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [caricando, setCaricando] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  async function aggiungi(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCaricando(true);
    setErrore(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessione scaduta: ricarica la pagina.");

      const blob = await comprimiImmagine(file);
      const percorso = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from("foto").upload(percorso, blob, { contentType: "image/jpeg" });
      if (error) throw new Error(error.message);

      await aggiungiFotoCrescita(plantId, percorso);
      router.refresh();
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Caricamento foto fallito.");
    } finally {
      setCaricando(false);
    }
  }

  async function elimina(f: PlantPhoto) {
    if (!confirm("Togliere questa foto dalla cronologia?")) return;
    try {
      await eliminaFotoCrescita(f.id, plantId, f.photo_path);
      router.refresh();
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Eliminazione fallita.");
    }
  }

  return (
    <div className="mt-5">
      <Etichetta>Foto nel tempo</Etichetta>
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {foto.map((f) => (
          <div key={f.id} className="relative shrink-0">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl" style={{ background: "var(--color-neutral-100)" }}>
              {fotoUrl[f.id] && <Image src={fotoUrl[f.id]!} alt="" fill unoptimized className="object-cover" />}
              <button
                type="button"
                onClick={() => elimina(f)}
                aria-label="Togli questa foto"
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs text-[var(--color-text)]"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                ×
              </button>
            </div>
            <p className="mt-1 text-center text-[10px] capitalize text-[var(--color-text-secondary)]">
              {formattaMeseAnnoDaData(f.created_at)}
            </p>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={caricando}
          className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl disabled:opacity-60"
          style={{ background: "var(--color-neutral-200)", border: "2px dashed rgba(32,30,29,.28)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#645c50" strokeWidth={2.75} strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="font-sans text-[10px] font-bold text-[var(--color-text-secondary)]">
            {caricando ? "…" : "Aggiungi"}
          </span>
        </button>
        <input ref={inputRef} type="file" accept="image/*" onChange={aggiungi} className="hidden" />
      </div>
      {errore && <p className="mt-1.5 text-sm text-[var(--color-casa-esclamativo)]">{errore}</p>}
    </div>
  );
}

export function DettaglioPianta({
  plant,
  fotoUrlIniziale,
  generi,
  fotoCrescita,
  fotoCrescitaUrl,
}: {
  plant: Plant;
  fotoUrlIniziale: string | undefined;
  generi: Genere[];
  fotoCrescita: PlantPhoto[];
  fotoCrescitaUrl: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(plant.name);
  const [genusId, setGenusId] = useState(plant.genus_id ?? "");
  const [purchaseYm, setPurchaseYm] = useState(plant.purchase_ym ?? "");
  const [propSoil, setPropSoil] = useState(plant.prop_soil);
  const [propHum, setPropHum] = useState(plant.prop_hum);
  const [casaTuttoAnno, setCasaTuttoAnno] = useState(plant.casa_tutto_anno);
  const [lastRepotDate, setLastRepotDate] = useState(plant.last_repot_date ?? "");
  const [potDiameterCm, setPotDiameterCm] = useState(plant.pot_diameter_cm?.toString() ?? "");
  const [maxHeight, setMaxHeight] = useState(plant.max_height ?? "???");
  const [maxWidth, setMaxWidth] = useState(plant.max_width ?? "???");
  const [darkPeriod, setDarkPeriod] = useState(plant.dark_period ?? "???");
  const [notes, setNotes] = useState(plant.notes);
  const [photoPath, setPhotoPath] = useState(plant.photo_path);
  const [fotoUrl, setFotoUrl] = useState(fotoUrlIniziale);

  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [mostraFormPersa, setMostraFormPersa] = useState(false);
  const [lostYm, setLostYm] = useState(plant.lost_ym ?? "");
  const [cause, setCause] = useState(plant.cause ?? "");
  const [lesson, setLesson] = useState(plant.lesson ?? "");
  const indicazioni = indicazioniPerPianta(plant);

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
          casaTuttoAnno,
          lastRepotDate: lastRepotDate || null,
          potDiameterCm: potDiameterCm ? Number(potDiameterCm.replace(",", ".")) : null,
          maxHeight,
          maxWidth,
          darkPeriod,
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
      <div
        className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-[20px]"
        style={{ background: "var(--color-neutral-100)" }}
      >
        {fotoUrl ? (
          <Image src={fotoUrl} alt={name} fill unoptimized className="object-cover" />
        ) : genusId ? (
          <IllustrazioneGenere
            genereId={genusId}
            className="flex h-full w-full items-center justify-center p-10"
            style={{ color: "var(--color-riparo)" }}
          />
        ) : null}
      </div>
      <label className="mt-2.5 block text-center font-sans text-sm font-bold" style={{ color: "var(--color-brand)" }}>
        {fotoUrl ? "Cambia foto" : "Aggiungi foto"}
        {/* Niente `capture`: deve restare la scelta fra scattare e pescare dalla galleria. */}
        <input type="file" accept="image/*" onChange={cambiaFoto} className="hidden" />
      </label>

      <GalleriaCrescita plantId={plant.id} foto={fotoCrescita} fotoUrl={fotoCrescitaUrl} />

      {plant.kind !== "lost" && (
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl p-3.5" style={{ background: "var(--color-neutral-100)" }}>
            <Etichetta>Esposizione</Etichetta>
            <div className="flex items-center gap-2.5 text-[var(--color-brand)]">
              <IconaEsposizione valore={indicazioni.esposizione} />
              <p className="font-heading text-lg text-[var(--color-text)]">{indicazioni.esposizione}</p>
            </div>
          </div>
          <div className="rounded-2xl p-3.5" style={{ background: "var(--color-neutral-100)" }}>
            <Etichetta>Terriccio</Etichetta>
            <div className="flex items-center gap-2.5 text-[var(--color-brand)]">
              <IconaTerriccio valore={indicazioni.terriccio} />
              <p className="font-heading text-lg text-[var(--color-text)]">{indicazioni.terriccio}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={salva} className="mt-5 flex flex-col gap-4">
        <label>
          <Etichetta>Nome</Etichetta>
          <input value={name} onChange={(e) => setName(e.target.value)} required className={classeCampo} style={{ border: BORDO_CAMPO }} />
        </label>

        <label>
          <Etichetta>Genere</Etichetta>
          <select value={genusId} onChange={(e) => setGenusId(e.target.value)} className={classeCampo} style={{ border: BORDO_CAMPO }}>
            <option value="">—</option>
            {generi.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nome}
              </option>
            ))}
          </select>
        </label>

        {plant.kind !== "wishlist" && (
          <label>
            <Etichetta>Mese di acquisto</Etichetta>
            <input
              type="month"
              value={purchaseYm}
              onChange={(e) => setPurchaseYm(e.target.value)}
              className={classeCampo}
              style={{ border: BORDO_CAMPO }}
            />
          </label>
        )}

        {plant.kind === "collection" && (
          <div>
            <Etichetta>Propagazione</Etichetta>
            <div className="flex gap-2.5">
              {(
                [
                  ["In terra", propSoil, setPropSoil],
                  ["Per umidità", propHum, setPropHum],
                ] as const
              ).map(([etichetta, valore, imposta]) => (
                <button
                  key={etichetta}
                  type="button"
                  onClick={() => imposta(!valore)}
                  className="flex h-[52px] flex-1 items-center gap-2.5 rounded-2xl px-3.5"
                  style={
                    valore
                      ? { background: "var(--color-fuori)", color: "#fff" }
                      : { background: "#fff", border: BORDO_CAMPO, color: "var(--color-text-secondary)" }
                  }
                >
                  {valore ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" aria-hidden="true">
                      <path d="M4 12l5 5 11-11" />
                    </svg>
                  ) : (
                    <i className="block h-[18px] w-[18px] rounded-md" style={{ border: "2px solid rgba(32,30,29,.3)" }} />
                  )}
                  <span className="font-sans text-sm font-bold">{etichetta}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {plant.kind === "collection" && (
          <div>
            <Etichetta>Ricovero</Etichetta>
            <button
              type="button"
              onClick={() => setCasaTuttoAnno((v) => !v)}
              className="flex h-[52px] w-full items-center gap-2.5 rounded-2xl px-3.5"
              style={
                casaTuttoAnno
                  ? { background: "var(--color-fuori)", color: "#fff" }
                  : { background: "#fff", border: BORDO_CAMPO, color: "var(--color-text-secondary)" }
              }
            >
              {casaTuttoAnno ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" aria-hidden="true">
                  <path d="M4 12l5 5 11-11" />
                </svg>
              ) : (
                <i className="block h-[18px] w-[18px] rounded-md" style={{ border: "2px solid rgba(32,30,29,.3)" }} />
              )}
              <span className="font-sans text-sm font-bold">
                Questa pianta sta bene in casa tutto l&apos;anno
              </span>
            </button>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-text-secondary)]">
              Un&apos;annotazione tua su questo esemplare, indipendente dall&apos;etichetta di ricovero
              generale della varietà.
            </p>
          </div>
        )}

        {plant.kind === "collection" && (
          <div className="grid grid-cols-2 gap-2.5">
            <label>
              <Etichetta>Ultimo rinvaso</Etichetta>
              <input
                type="date"
                value={lastRepotDate}
                onChange={(e) => setLastRepotDate(e.target.value)}
                className={classeCampo}
                style={{ border: BORDO_CAMPO }}
              />
            </label>
            <label>
              <Etichetta>Diametro vaso cm</Etichetta>
              <input
                type="number"
                min="0"
                step="0.5"
                value={potDiameterCm}
                onChange={(e) => setPotDiameterCm(e.target.value)}
                className={classeCampo}
                style={{ border: BORDO_CAMPO }}
              />
            </label>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <label>
            <Etichetta>Altezza max</Etichetta>
            <input value={maxHeight} onChange={(e) => setMaxHeight(e.target.value)} className={classeCampo} style={{ border: BORDO_CAMPO }} />
          </label>
          <label>
            <Etichetta>Larghezza max</Etichetta>
            <input value={maxWidth} onChange={(e) => setMaxWidth(e.target.value)} className={classeCampo} style={{ border: BORDO_CAMPO }} />
          </label>
        </div>

        <label>
          <Etichetta>Periodo di buio</Etichetta>
          <input value={darkPeriod} onChange={(e) => setDarkPeriod(e.target.value)} className={classeCampo} style={{ border: BORDO_CAMPO }} />
        </label>

        <label>
          <Etichetta>Note</Etichetta>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={classeArea} style={{ border: BORDO_CAMPO }} />
        </label>

        {plant.kind === "lost" && (
          <>
            <label>
              <Etichetta>Mese della perdita</Etichetta>
              <input type="month" value={lostYm} onChange={(e) => setLostYm(e.target.value)} className={classeCampo} style={{ border: BORDO_CAMPO }} />
            </label>
            <div>
              <Etichetta>Causa</Etichetta>
              <SelettoreCausa value={cause} onChange={setCause} />
            </div>
            <label>
              <Etichetta>Lezione imparata</Etichetta>
              <textarea value={lesson} onChange={(e) => setLesson(e.target.value)} rows={2} className={classeArea} style={{ border: BORDO_CAMPO }} />
            </label>
          </>
        )}

        {errore && <p className="text-sm text-[var(--color-casa-esclamativo)]">{errore}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="h-[52px] rounded-2xl font-heading text-[15px] text-white disabled:opacity-60"
          style={{ background: "var(--color-brand)" }}
        >
          {salvando ? "Salvo…" : "Salva modifiche"}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-2.5 pt-6" style={{ borderTop: "1px solid var(--color-divider)" }}>
        {plant.kind === "wishlist" && (
          <button
            onClick={promuovi}
            disabled={salvando}
            className="h-[52px] rounded-2xl font-heading text-[15px]"
            style={{ border: "2px solid var(--color-fuori)", color: "var(--color-fuori)" }}
          >
            Promuovi a collezione
          </button>
        )}

        {plant.kind === "collection" && !mostraFormPersa && (
          <button
            onClick={() => setMostraFormPersa(true)}
            className="h-[52px] rounded-2xl font-heading text-[15px]"
            style={{ border: "2px solid var(--color-casa-esclamativo)", color: "var(--color-casa-esclamativo)" }}
          >
            Segna come persa
          </button>
        )}

        {plant.kind === "collection" && mostraFormPersa && (
          <div className="rounded-[20px] p-4" style={{ background: "var(--color-casa-esclamativo-tinta)" }}>
            <p className="font-heading text-base text-[var(--color-text)]">Sposta al cimitero</p>
            <label className="mt-3 block">
              <Etichetta>Mese</Etichetta>
              <input type="month" value={lostYm} onChange={(e) => setLostYm(e.target.value)} className={classeCampo} style={{ border: BORDO_CAMPO }} />
            </label>
            <div className="mt-3">
              <Etichetta>Causa</Etichetta>
              <SelettoreCausa value={cause} onChange={setCause} />
            </div>
            <label className="mt-3 block">
              <Etichetta>Lezione imparata</Etichetta>
              <textarea value={lesson} onChange={(e) => setLesson(e.target.value)} rows={2} className={classeArea} style={{ border: BORDO_CAMPO }} />
            </label>
            <div className="mt-3 flex gap-2.5">
              <button
                onClick={() => setMostraFormPersa(false)}
                className="h-11 flex-1 rounded-xl bg-white text-sm font-medium text-[var(--color-text-secondary)]"
              >
                Annulla
              </button>
              <button
                onClick={confermaPersa}
                disabled={salvando}
                className="h-11 flex-1 rounded-xl text-sm font-medium text-white disabled:opacity-60"
                style={{ background: "var(--color-casa-esclamativo)" }}
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
            className="h-[52px] rounded-2xl font-heading text-[15px]"
            style={{ border: "2px solid var(--color-fuori)", color: "var(--color-fuori)" }}
          >
            Riporta in collezione
          </button>
        )}

        <button
          onClick={elimina}
          disabled={salvando}
          className="h-11 text-sm text-[var(--color-text-secondary)] underline underline-offset-2"
        >
          Elimina
        </button>
      </div>
    </div>
  );
}
