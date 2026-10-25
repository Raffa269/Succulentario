import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { POSTER_COLLEZIONE_ABILITATO } from "@/features/poster-collezione/config";
import { ScaricaPoster } from "@/features/poster-collezione/download";

export const metadata = { title: "Poster collezione · Succulentario" };

export default function PaginaPosterCollezione() {
  if (!POSTER_COLLEZIONE_ABILITATO) notFound();
  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-3">
      <AppHeader />
      <Link href="/collezione" className="text-sm underline">Torna alla collezione</Link>
      <h1 className="mb-4 mt-4 font-heading text-2xl">Poster collezione</h1>
      <div className="rounded-2xl border border-black/10 bg-[var(--color-neutral-100)] p-5">
        <p className="text-base leading-relaxed">Vuoi creare una rappresentazione grafica della tua passione? scarica i file con il pulsante sottostante, caricali in una nuova chat di chatgpt e invia. Se poi vuoi anche aggiungere una tua immagine stilizzata, successivamente caricala chiedendo di aggiungerti in una zona a tua scelta</p>
        <ScaricaPoster />
      </div>
    </div>
  );
}
