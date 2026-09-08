import Link from "next/link";
import { formattaMese, type Plant } from "@/lib/plants";

/** Card del cimitero (mockup 1h): binomio, mese, causa e lezione imparata. */
export function CimiteroCard({ plant }: { plant: Plant }) {
  return (
    <Link
      href={`/piante/${plant.id}`}
      className="block rounded-[18px] px-[15px] py-3.5"
      style={{ background: "var(--color-neutral-100)" }}
    >
      <div className="flex items-baseline justify-between gap-2.5">
        <span className="font-serif text-[17px] italic leading-tight text-[var(--color-text)]">{plant.name}</span>
        {plant.lost_ym && (
          <span
            className="shrink-0 font-sans text-xs font-medium text-[var(--color-text-secondary)]"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formattaMese(plant.lost_ym)}
          </span>
        )}
      </div>
      {(plant.cause || plant.lesson) && (
        <p className="mt-1.5 text-sm leading-snug text-[var(--color-text)]">
          {plant.cause}
          {plant.cause && plant.lesson && " "}
          {plant.lesson && <b>Da allora: {plant.lesson}</b>}
        </p>
      )}
    </Link>
  );
}
