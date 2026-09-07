import Link from "next/link";
import { caricaPiante } from "@/lib/piante-server";
import { ElencoPiante } from "@/components/elenco-piante";

export const metadata = { title: "Wishlist · Succulentario" };

export default async function PaginaWishlist() {
  const { piante, fotoUrl } = await caricaPiante("wishlist");

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-[var(--color-text)]">Wishlist</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{piante.length} piante</p>
        </div>
        <Link
          href="/piante/nuova?kind=wishlist"
          className="flex h-10 items-center rounded-lg bg-[var(--color-fuori)] px-4 text-sm font-medium text-white"
        >
          + Aggiungi
        </Link>
      </div>

      <div className="mt-4">
        <ElencoPiante
          piante={piante}
          fotoUrl={fotoUrl}
          vuoto="Vuota per ora. Vai su un genere e tocca «La voglio»."
        />
      </div>
    </div>
  );
}
