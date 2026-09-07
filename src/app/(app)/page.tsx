import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { contaCatalogo } from "@/lib/catalogo";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { totaleVarieta } = contaCatalogo();

  const { data: piante } = await supabase
    .from("plants")
    .select("kind, var_key")
    .eq("owner", user!.id);

  const collezione = (piante ?? []).filter((p) => p.kind === "collection");
  const wishlist = (piante ?? []).filter((p) => p.kind === "wishlist");
  const cimitero = (piante ?? []).filter((p) => p.kind === "lost");
  const varietaPossedute = new Set(collezione.map((p) => p.var_key).filter(Boolean)).size;
  const copertura = totaleVarieta > 0 ? Math.round((varietaPossedute / totaleVarieta) * 100) : 0;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6">
      <p className="text-[var(--color-text-secondary)]">
        Accesso eseguito come <strong>{user?.email}</strong>.
      </p>

      <Link
        href="/collezione"
        className="rounded-lg border border-black/10 bg-[var(--color-surface)] p-5"
      >
        <p className="font-mono text-2xl text-[var(--color-fuori)]">{collezione.length}</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          piante in collezione — copertura del catalogo {copertura}%
        </p>
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/wishlist"
          className="rounded-lg border border-black/10 bg-[var(--color-surface)] p-5"
        >
          <p className="font-mono text-2xl text-[var(--color-riparo)]">{wishlist.length}</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">in wishlist</p>
        </Link>
        <Link
          href="/cimitero"
          className="rounded-lg border border-black/10 bg-[var(--color-surface)] p-5"
        >
          <p className="font-mono text-2xl text-[var(--color-casa-esclamativo)]">{cimitero.length}</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">nel cimitero</p>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/guida"
          className="rounded-lg border border-black/10 bg-[var(--color-surface)] p-4"
        >
          <p className="font-medium text-[var(--color-text)]">Guida generale</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Luce, acqua, calendario.</p>
        </Link>
        <Link
          href="/impostazioni"
          className="rounded-lg border border-black/10 bg-[var(--color-surface)] p-4"
        >
          <p className="font-medium text-[var(--color-text)]">Impostazioni</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Importa il backup dell&apos;artifact.</p>
        </Link>
      </div>
    </div>
  );
}
