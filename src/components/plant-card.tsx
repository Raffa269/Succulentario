import Link from "next/link";
import Image from "next/image";
import { getGenere } from "@/lib/catalogo";
import { IllustrazioneGenere } from "@/components/illustrazione-genere";
import { formattaMese, type Plant } from "@/lib/plants";

export function PlantCard({ plant, fotoUrl }: { plant: Plant; fotoUrl?: string }) {
  const genere = plant.genus_id ? getGenere(plant.genus_id) : undefined;

  return (
    <Link
      href={`/piante/${plant.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-black/10 bg-[var(--color-surface)]"
    >
      <div className="relative aspect-square bg-[var(--color-bg)]">
        {fotoUrl ? (
          <Image src={fotoUrl} alt={plant.name} fill unoptimized className="object-cover" />
        ) : genere ? (
          <IllustrazioneGenere
            genereId={genere.id}
            className="flex h-full w-full items-center justify-center p-7 text-[var(--color-fuori)]/50"
          />
        ) : null}
        {plant.num != null && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 font-mono text-xs text-white">
            #{plant.num}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 p-3">
        <p className="font-medium italic text-[var(--color-text)]">{plant.name}</p>
        {genere && <p className="text-xs text-[var(--color-text-secondary)]">{genere.nome}</p>}
        {plant.purchase_ym && (
          <p className="mt-1 font-mono text-xs capitalize text-[var(--color-text-secondary)]">
            {formattaMese(plant.purchase_ym)}
          </p>
        )}
      </div>
    </Link>
  );
}
