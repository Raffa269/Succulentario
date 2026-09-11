import Link from "next/link";
import Image from "next/image";
import { getGenere, getVarietaByKey, type Ricovero } from "@/lib/catalogo";
import { IllustrazioneGenere } from "@/components/illustrazione-genere";
import { formattaMese, type Plant } from "@/lib/plants";

const FASCIA: Record<Ricovero, { bg: string; testoChiaro: boolean; etichetta: string }> = {
  fuori: { bg: "var(--color-fuori)", testoChiaro: true, etichetta: "fuori" },
  riparo: { bg: "var(--color-riparo)", testoChiaro: true, etichetta: "riparo" },
  casa: { bg: "var(--color-casa)", testoChiaro: false, etichetta: "casa" },
  "casa!": { bg: "var(--color-casa-esclamativo)", testoChiaro: true, etichetta: "casa!" },
};

const SFONDO_ILLUSTRAZIONE: Record<Ricovero, { tinta: string; inchiostro: string }> = {
  fuori: { tinta: "var(--color-fuori-tinta)", inchiostro: "#0f5c30" },
  riparo: { tinta: "var(--color-riparo-tinta)", inchiostro: "#0d5486" },
  casa: { tinta: "var(--color-casa-tinta)", inchiostro: "#8a5c00" },
  "casa!": { tinta: "var(--color-casa-esclamativo-tinta)", inchiostro: "#8f2a1a" },
};

function ChipPropagazione({ attiva, children }: { attiva: boolean; children: string }) {
  return (
    <span
      className="rounded-md px-1.5 py-1 font-sans text-[10px] font-bold tracking-wide"
      style={{
        background: attiva ? "var(--color-fuori-tinta)" : "var(--color-neutral-200)",
        color: attiva ? "#0f5c30" : "var(--color-text-secondary)",
      }}
    >
      {children}
    </span>
  );
}

export function PlantCard({
  plant,
  fotoUrl,
  duplicato,
}: {
  plant: Plant;
  fotoUrl?: string;
  /** Un'altra pianta della collezione ha la stessa varietà schedata (stesso var_key). */
  duplicato?: boolean;
}) {
  const genere = plant.genus_id ? getGenere(plant.genus_id) : undefined;
  const varieta = plant.var_key ? getVarietaByKey(plant.var_key) : undefined;
  const ricovero = plant.kind === "lost" ? undefined : varieta?.ricovero;
  const illustrazione = ricovero ? SFONDO_ILLUSTRAZIONE[ricovero] : SFONDO_ILLUSTRAZIONE.riparo;

  return (
    <Link
      href={`/piante/${plant.id}`}
      className="flex flex-col overflow-hidden rounded-[20px]"
      style={{ background: "var(--color-neutral-100)" }}
    >
      {fotoUrl ? (
        <div className="relative h-[112px] w-full">
          <Image src={fotoUrl} alt={plant.name} fill unoptimized className="object-cover" />
          {duplicato && (
            <span
              className="absolute bottom-1.5 left-1.5 rounded-md px-1.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wide text-white"
              style={{ background: "var(--color-casa-esclamativo)" }}
            >
              doppio
            </span>
          )}
        </div>
      ) : (
        <div className="relative flex h-[112px] items-center justify-center" style={{ background: illustrazione.tinta }}>
          {genere && (
            <IllustrazioneGenere genereId={genere.id} className="h-16 w-16" style={{ color: illustrazione.inchiostro }} />
          )}
          {duplicato && (
            <span
              className="absolute bottom-1.5 left-1.5 rounded-md px-1.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wide text-white"
              style={{ background: "var(--color-casa-esclamativo)" }}
            >
              doppio
            </span>
          )}
        </div>
      )}

      {ricovero && (
        <div className="px-2.5 py-1" style={{ background: FASCIA[ricovero].bg }}>
          <span
            className="font-sans text-xs font-bold tracking-wide"
            style={{ color: FASCIA[ricovero].testoChiaro ? "#fff" : "var(--color-text)" }}
          >
            {FASCIA[ricovero].etichetta}
          </span>
        </div>
      )}

      <div className="px-2.5 pb-2.5 pt-2">
        {plant.num != null && (
          <p
            className="font-mono text-[11px] text-[var(--color-text-secondary)]"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {String(plant.num).padStart(3, "0")}
          </p>
        )}
        <p className="mt-0.5 font-serif text-[17px] italic leading-tight text-[var(--color-text)]">{plant.name}</p>
        <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">
          {genere?.nome ?? "—"}
          {plant.purchase_ym ? ` · ${formattaMese(plant.purchase_ym)}` : ""}
        </p>
        {plant.kind === "collection" && (
          <div className="mt-2 flex gap-1.5">
            <ChipPropagazione attiva={plant.prop_soil}>TERRA</ChipPropagazione>
            <ChipPropagazione attiva={plant.prop_hum}>UMIDITÀ</ChipPropagazione>
          </div>
        )}
      </div>
    </Link>
  );
}
