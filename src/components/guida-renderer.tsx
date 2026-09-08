import type { ReactNode } from "react";
import type { BloccoGuida } from "@/lib/catalogo";

/**
 * Renderizza i blocchi di dati/guida.json. Le voci `ul` possono contenere
 * `<b>...</b>` intenzionali (SPECIFICA.md §5): si riconoscono solo quelli,
 * per il resto il testo resta testo — niente `dangerouslySetInnerHTML`
 * libero su contenuto arbitrario.
 */
function conGrassetto(testo: string): ReactNode[] {
  return testo.split(/(<b>.*?<\/b>)/g).map((parte, i) => {
    const match = /^<b>(.*)<\/b>$/.exec(parte);
    return match ? <b key={i}>{match[1]}</b> : parte;
  });
}

function TabellaGuida({ tabella }: { tabella: { head: string[]; rows: string[][] } }) {
  return (
    <div className="overflow-x-auto rounded-2xl" style={{ background: "var(--color-neutral-100)" }}>
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr>
            {tabella.head.map((cella, i) => (
              <th
                key={i}
                className="p-3 text-left font-sans text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]"
                style={{ borderBottom: "1px solid var(--color-divider)" }}
              >
                {cella}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabella.rows.map((riga, i) => (
            <tr key={i} style={{ borderBottom: i < tabella.rows.length - 1 ? "1px solid var(--color-divider)" : undefined }}>
              {riga.map((cella, j) => (
                <td key={j} className="p-3 align-top text-[var(--color-text)]">
                  {cella}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CalloutGuida({ callout }: { callout: { t: string; x: string } }) {
  return (
    <aside className="rounded-2xl p-4" style={{ background: "var(--color-riparo-tinta)" }}>
      <p className="font-sans text-[15px] font-bold text-[var(--color-text)]">{callout.t}</p>
      <p className="mt-1 text-sm leading-relaxed text-[var(--color-text)]">{callout.x}</p>
    </aside>
  );
}

export function BloccoGuidaView({ blocco }: { blocco: BloccoGuida }) {
  if ("h" in blocco) {
    return <h1 className="font-heading text-3xl text-[var(--color-text)]">{blocco.h}</h1>;
  }
  if ("lead" in blocco) {
    return <p className="text-lg leading-relaxed text-[var(--color-text-secondary)]">{blocco.lead}</p>;
  }
  if ("h2" in blocco) {
    return (
      <h2 className="mt-4 font-heading text-2xl text-[var(--color-text)]">{blocco.h2}</h2>
    );
  }
  if ("h3" in blocco) {
    return <h3 className="font-heading text-xl text-[var(--color-text)]">{blocco.h3}</h3>;
  }
  if ("p" in blocco) {
    return <p className="text-[var(--color-text)]">{blocco.p}</p>;
  }
  if ("ul" in blocco) {
    return (
      <ul className="list-disc space-y-1.5 pl-5 text-[var(--color-text)]">
        {blocco.ul.map((voce, i) => (
          <li key={i}>{conGrassetto(voce)}</li>
        ))}
      </ul>
    );
  }
  if ("table" in blocco) {
    return <TabellaGuida tabella={blocco.table} />;
  }
  if ("callout" in blocco) {
    return <CalloutGuida callout={blocco.callout} />;
  }
  return null;
}
