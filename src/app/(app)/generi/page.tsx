import Link from "next/link";
import { generi } from "@/lib/catalogo";
import { IllustrazioneGenere } from "@/components/illustrazione-genere";
import { AppHeader } from "@/components/app-header";

export const metadata = { title: "Generi · Succulentario" };

export default function PaginaGeneri() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-3">
      <AppHeader />
      <h1 className="mb-1 font-heading text-2xl text-[var(--color-text)]">Generi</h1>
      <p className="mb-5 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
        11 generi, dalla Sansevieria ai Lithops.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {generi.map((g) => (
          <Link
            key={g.id}
            href={`/generi/${g.id}`}
            className="flex flex-col items-center gap-2 rounded-[20px] p-4 text-center"
            style={{ background: "var(--color-neutral-100)" }}
          >
            <IllustrazioneGenere genereId={g.id} className="h-16 w-16" style={{ color: "var(--color-riparo)" }} />
            <span className="font-sans text-[15px] font-bold text-[var(--color-text)]">{g.nome}</span>
            <span className="text-xs text-[var(--color-text-secondary)]">{g.fam}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
