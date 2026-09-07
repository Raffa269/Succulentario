import { ModuloNuovaPianta } from "@/components/modulo-nuova-pianta";
import { generi } from "@/lib/catalogo";

export const metadata = { title: "Aggiungi pianta · Succulentario" };

export default async function PaginaNuovaPianta({
  searchParams,
}: PageProps<"/piante/nuova">) {
  const sp = await searchParams;
  const kindIniziale = sp.kind === "wishlist" ? "wishlist" : "collection";

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-serif text-2xl text-[var(--color-text)]">Aggiungi pianta</h1>
      <ModuloNuovaPianta kindIniziale={kindIniziale} generi={generi} />
    </div>
  );
}
