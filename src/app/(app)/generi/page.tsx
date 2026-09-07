import Link from "next/link";
import { generi } from "@/lib/catalogo";
import { IllustrazioneGenere } from "@/components/illustrazione-genere";

export const metadata = { title: "Generi · Succulentario" };

export default function PaginaGeneri() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-serif text-2xl text-[var(--color-text)]">Generi</h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        11 generi, dalla Sansevieria ai Lithops.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {generi.map((g) => (
          <Link
            key={g.id}
            href={`/generi/${g.id}`}
            className="flex flex-col items-center gap-2 rounded-lg border border-black/10 bg-[var(--color-surface)] p-4 text-center"
          >
            <IllustrazioneGenere genereId={g.id} className="h-16 w-16 text-[var(--color-fuori)]" />
            <span className="font-medium text-[var(--color-text)]">{g.nome}</span>
            <span className="text-xs text-[var(--color-text-secondary)]">{g.fam}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
