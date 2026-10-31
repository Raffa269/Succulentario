import type { Esposizione, Terriccio } from "@/lib/coltivazione";

/** Luce: serie 2 scelta dall'utente. SVG leggibili anche sulle card mobili. */
export function IconaLuce({ valore }: { valore: Esposizione }) {
  const ombra = valore === "mezz'ombra";
  return (
    <svg viewBox="0 0 80 80" className="h-6 w-6" aria-hidden="true" fill="none">
      <g transform={ombra ? "translate(-5 -7) scale(.9)" : undefined}>
        <path d="M40 6v8M40 66v8M6 40h8M66 40h8M16 16l6 6M58 58l6 6M64 16l-6 6M22 58l-6 6" stroke="#bc8218" strokeWidth="4" strokeLinecap="round" />
        <circle cx="40" cy="40" r="20" fill="#ffcf54" stroke="#bc8218" strokeWidth="3" />
        {valore === "mezzo sole" && <path d="M40 22a18 18 0 0 1 0 36Z" fill="#df9a28" />}
      </g>
      {ombra && <path d="M28 65a13 13 0 0 1-2-26 17 17 0 0 1 32-2 14 14 0 1 1 4 28Z" fill="#d3e2e6" stroke="#819fa8" strokeWidth="2.5" strokeLinejoin="round" />}
    </svg>
  );
}

/** Terriccio: versione A, con acqua trattenuta / deflusso dal vaso. */
export function IconaSubstrato({ valore }: { valore: Terriccio }) {
  const livello = valore === "meno drenante" ? 31 : valore === "normale" ? 45 : 52;
  const frecce = valore === "meno drenante" ? [] : valore === "normale" ? [40] : [27, 40, 53];
  return (
    <svg viewBox="0 0 80 80" className="h-6 w-6" aria-hidden="true" fill="none">
      <path d="M15 18h50L57 60H23Z" fill="#d8ae87" stroke="#916848" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M20 26h40l-6 30H26Z" fill="#d5c0a0" />
      <path d={`M25 ${livello}l10-2 10 2 10-2L52 56H28Z`} fill="#88bed0" />
      <path d={`M25 ${livello}l10-2 10 2 10-2`} stroke="#4c91b0" strokeWidth="2" />
      <path d="M13 18h54" stroke="#916848" strokeWidth="4" strokeLinecap="round" />
      {valore === "meno drenante" && <>
        <path d="M29 64h22" stroke="#916848" strokeWidth="3" strokeLinecap="round" />
        <path d="M40 3c-2 4-5 6-5 9a5 5 0 0 0 10 0c0-3-3-5-5-9Z" fill="#4c91b0" />
      </>}
      {frecce.map((x) => <path key={x} d={`M${x} 64v11m-4-4 4 4 4-4`} stroke="#4c91b0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />)}
    </svg>
  );
}
