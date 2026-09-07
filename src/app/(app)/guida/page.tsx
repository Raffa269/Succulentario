import { guida } from "@/lib/catalogo";
import { BloccoGuidaView } from "@/components/guida-renderer";

export const metadata = { title: "Guida · Succulentario" };

export default function PaginaGuida() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      {guida.map((blocco, i) => (
        <BloccoGuidaView key={i} blocco={blocco} />
      ))}
    </div>
  );
}
