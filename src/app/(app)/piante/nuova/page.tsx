import { ModuloNuovaPianta } from "@/components/modulo-nuova-pianta";
import { generi } from "@/lib/catalogo";

export const metadata = { title: "Aggiungi pianta · Succulentario" };

export default async function PaginaNuovaPianta({
  searchParams,
}: PageProps<"/piante/nuova">) {
  const sp = await searchParams;
  const kindIniziale = sp.kind === "wishlist" ? "wishlist" : "collection";

  return (
    <div className="mx-auto max-w-2xl">
      <ModuloNuovaPianta kindIniziale={kindIniziale} generi={generi} />
    </div>
  );
}
