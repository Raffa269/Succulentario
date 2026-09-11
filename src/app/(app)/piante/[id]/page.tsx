import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { urlFirmate } from "@/lib/foto-url";
import { DettaglioPianta } from "@/components/dettaglio-pianta";
import { generi } from "@/lib/catalogo";
import type { Plant, PlantPhoto } from "@/lib/plants";

const PAGINA_PER_KIND = { collection: "/collezione", wishlist: "/wishlist", lost: "/cimitero" } as const;

export default async function PaginaPianta({ params }: PageProps<"/piante/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("plants")
    .select("*")
    .eq("id", id)
    .eq("owner", user!.id)
    .maybeSingle();

  if (!data) notFound();
  const plant = data as Plant;

  const { data: fotoCrescitaGrezze } = await supabase
    .from("plant_photos")
    .select("*")
    .eq("plant_id", id)
    .order("created_at", { ascending: true });
  const fotoCrescita = (fotoCrescitaGrezze ?? []) as PlantPhoto[];

  const mappa = await urlFirmate(supabase, [plant.photo_path, ...fotoCrescita.map((f) => f.photo_path)]);
  const fotoUrl = plant.photo_path ? mappa.get(plant.photo_path) : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-3">
      <Link
        href={PAGINA_PER_KIND[plant.kind]}
        className="mb-2 flex h-11 w-fit items-center gap-2 font-sans text-[15px] font-bold"
        style={{ color: "var(--color-brand)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth={3} strokeLinecap="round" aria-hidden="true">
          <path d="M14 6l-6 6 6 6" />
        </svg>
        Indietro
      </Link>
      <DettaglioPianta
        plant={plant}
        fotoUrlIniziale={fotoUrl}
        generi={generi}
        fotoCrescita={fotoCrescita}
        fotoCrescitaUrl={Object.fromEntries(fotoCrescita.map((f) => [f.id, mappa.get(f.photo_path)]))}
      />
    </div>
  );
}
