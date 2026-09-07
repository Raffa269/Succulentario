import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { urlFirmate } from "@/lib/foto-url";
import { DettaglioPianta } from "@/components/dettaglio-pianta";
import { generi } from "@/lib/catalogo";
import type { Plant } from "@/lib/plants";

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

  const mappa = await urlFirmate(supabase, [plant.photo_path]);
  const fotoUrl = plant.photo_path ? mappa.get(plant.photo_path) : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <DettaglioPianta plant={plant} fotoUrlIniziale={fotoUrl} generi={generi} />
    </div>
  );
}
