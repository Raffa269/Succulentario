import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { contaCatalogo } from "@/lib/catalogo";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { totaleGeneri, totaleVarieta } = contaCatalogo();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6">
      <p className="text-[var(--color-text-secondary)]">
        Accesso eseguito come <strong>{user?.email}</strong>.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/generi"
          className="rounded-lg border border-black/10 bg-[var(--color-surface)] p-5"
        >
          <p className="font-mono text-2xl text-[var(--color-fuori)]">{totaleGeneri}</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">generi</p>
        </Link>
        <Link
          href="/cerca"
          className="rounded-lg border border-black/10 bg-[var(--color-surface)] p-5"
        >
          <p className="font-mono text-2xl text-[var(--color-fuori)]">{totaleVarieta}</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">varietà schedate</p>
        </Link>
      </div>

      <Link
        href="/guida"
        className="rounded-lg border border-black/10 bg-[var(--color-surface)] p-5"
      >
        <p className="font-medium text-[var(--color-text)]">Guida generale</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Luce, acqua, terriccio, rinvaso, propagazione, calendario stagionale.
        </p>
      </Link>

      <div className="rounded-lg border border-black/10 bg-[var(--color-surface)] p-5">
        <p className="font-mono text-sm text-[var(--color-text-secondary)]">Tappa 2</p>
        <p className="mt-1 text-[var(--color-text)]">
          Catalogo consultabile: generi, varietà con etichetta di ricovero, guida,
          ricerca. La collezione personale (piante, foto, wishlist) arriva nella
          prossima tappa.
        </p>
      </div>
    </div>
  );
}
