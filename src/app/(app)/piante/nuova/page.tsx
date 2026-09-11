import { ModuloNuovaPianta } from "@/components/modulo-nuova-pianta";
import { generi } from "@/lib/catalogo";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Aggiungi pianta · Succulentario" };

export default async function PaginaNuovaPianta({
  searchParams,
}: PageProps<"/piante/nuova">) {
  const sp = await searchParams;
  const kindIniziale = sp.kind === "wishlist" ? "wishlist" : "collection";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: possedute } = await supabase
    .from("plants")
    .select("var_key")
    .eq("owner", user!.id)
    .eq("kind", "collection");
  const varKeyPossedute = (possedute ?? []).map((p) => p.var_key).filter((k): k is string => !!k);

  return (
    <div className="mx-auto max-w-2xl">
      <ModuloNuovaPianta kindIniziale={kindIniziale} generi={generi} varKeyPossedute={varKeyPossedute} />
    </div>
  );
}
