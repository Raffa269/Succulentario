import Link from "next/link";
import Image from "next/image";
import { getGenere, getVarietaByKey, type Ricovero } from "@/lib/catalogo";
import { IllustrazioneGenere } from "@/components/illustrazione-genere";
import type { Plant } from "@/lib/plants";
import { indicazioniPerPianta, type Esposizione, type Terriccio } from "@/lib/coltivazione";

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

function IconaEsposizione({ valore }: { valore: Esposizione }) {
  if (valore === "sole pieno") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <circle cx="12" cy="12" r="4" fill="currentColor" />
        <path
          d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
    );
  }
  if (valore === "mezzo sole") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path d="M12 4a8 8 0 1 0 0 16Z" fill="currentColor" />
        <path
          d="M12 4a8 8 0 0 1 0 16M12 1.8v2.4M12 19.8v2.4M1.8 12h2.4M19.8 12h2.4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M5 18h14a7 7 0 0 0-14 0Z" fill="currentColor" opacity="0.28" />
      <path d="M4 18h16M8 14.5a5 5 0 0 1 8 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M3 7c3 2 6 2 9 0s6-2 9 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function IconaTerriccio({ valore }: { valore: Terriccio }) {
  const punti = valore === "meno drenante" ? 3 : valore === "normale" ? 5 : 7;
  const coordinate = [
    [6, 15],
    [10, 12],
    [14, 16],
    [18, 13],
    [8, 18],
    [13, 19],
    [17, 18],
  ];
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M4 11h16l-2.2 8H6.2Z" fill="currentColor" opacity="0.22" />
      <path d="M4 11h16M6.2 19h11.6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      {coordinate.slice(0, punti).map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.1" fill="currentColor" />
      ))}
    </svg>
  );
}

function BadgeIndicazione({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span
      title={label}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-full"
      style={{ background: "var(--color-neutral-200)", color: "var(--color-brand)" }}
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
  const indicazioni = indicazioniPerPianta(plant);

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
        {plant.kind !== "lost" && (
          <div className="mt-2 flex gap-1.5">
            <BadgeIndicazione label={`Esposizione: ${indicazioni.esposizione}`}>
              <IconaEsposizione valore={indicazioni.esposizione} />
            </BadgeIndicazione>
            <BadgeIndicazione label={`Terriccio: ${indicazioni.terriccio}`}>
              <IconaTerriccio valore={indicazioni.terriccio} />
            </BadgeIndicazione>
          </div>
        )}
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
