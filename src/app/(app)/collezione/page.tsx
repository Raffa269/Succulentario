import Link from "next/link";
import { caricaPiante } from "@/lib/piante-server";
import { ElencoPiante } from "@/components/elenco-piante";
import { AppHeader } from "@/components/app-header";
import { CardCopertura } from "@/components/card-copertura";
import { contaCatalogo } from "@/lib/catalogo";

export const metadata = { title: "Collezione · Succulentario" };

export default async function PaginaCollezione() {
  const { piante, fotoUrl } = await caricaPiante("collection");
  const { totaleVarieta } = contaCatalogo();

  return (
    <div className="relative mx-auto max-w-2xl px-4 pb-8 pt-3">
      <AppHeader />
      <CardCopertura varKeys={piante.map((p) => p.var_key)} />

      <ElencoPiante
        piante={piante}
        fotoUrl={fotoUrl}
        ordinamenti={["catalogo", "recenti", "nome", "genere"]}
        vuoto="Nessuna pianta ancora. Aggiungine una, o vai su un genere e tocca «Ho questa»."
        placeholder={`Cerca fra ${totaleVarieta} varietà`}
      />

      <Link
        href="/piante/nuova?kind=collection"
        className="fixed bottom-24 right-4 z-10 flex h-14 items-center gap-2 rounded-full pl-5 pr-6 text-white"
        style={{ background: "var(--color-brand)", boxShadow: "var(--shadow-md)" }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span className="font-heading text-[17px]">Aggiungi</span>
      </Link>
    </div>
  );
}
