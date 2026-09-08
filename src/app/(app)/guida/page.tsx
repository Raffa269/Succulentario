import { guida } from "@/lib/catalogo";
import { BloccoGuidaView } from "@/components/guida-renderer";
import { AppHeader } from "@/components/app-header";

export const metadata = { title: "Guida · Succulentario" };

export default function PaginaGuida() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 pb-8 pt-3">
      <AppHeader />
      {guida.map((blocco, i) => (
        <BloccoGuidaView key={i} blocco={blocco} />
      ))}
    </div>
  );
}
