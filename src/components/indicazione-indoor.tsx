import type { IndicazioneIndoor, FasciaPpfd } from "@/lib/indoor";

const COLORI: Record<FasciaPpfd, string> = {
  1: "#87a96b",
  2: "#b7bd65",
  3: "#d4ad54",
  4: "#d48445",
  5: "#c85f45",
};

function fasciaAttiva(fascia: FasciaPpfd, [min, max]: IndicazioneIndoor["fasce"]) {
  return fascia >= min && fascia <= max;
}

export function BarraPpfd({ indoor }: { indoor: IndicazioneIndoor }) {
  return (
    <div className="grid grid-cols-5 gap-1" aria-label={`${indoor.etichetta}, ${indoor.ppfd}`}>
      {([1, 2, 3, 4, 5] as FasciaPpfd[]).map((fascia) => {
        const attiva = fasciaAttiva(fascia, indoor.fasce);
        return (
          <span
            key={fascia}
            className="h-2 rounded-full"
            style={{ background: attiva ? COLORI[fascia] : "var(--color-neutral-200)" }}
          />
        );
      })}
    </div>
  );
}

export function IconaGrowLight({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M7 5h10l1.5 5h-13Z" fill="currentColor" opacity="0.22" />
      <path d="M7 5h10l1.5 5h-13ZM9 3h6M12 10v3M8 15l-1.5 3M12 15v3.5M16 15l1.5 3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M6 21h12" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export function RiquadroIndoor({ indoor, className = "" }: { indoor: IndicazioneIndoor; className?: string }) {
  return (
    <section className={`rounded-2xl p-3.5 ${className}`} style={{ background: "var(--color-neutral-100)" }}>
      <div className="mb-2 flex items-start gap-2.5 text-[var(--color-brand)]">
        <IconaGrowLight className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-sans text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Indoor con grow light
          </p>
          <p className="mt-0.5 font-heading text-lg leading-tight text-[var(--color-text)]">{indoor.etichetta}</p>
        </div>
      </div>
      <div className="mb-2">
        <BarraPpfd indoor={indoor} />
      </div>
      <p className="font-sans text-xs font-bold text-[var(--color-text-secondary)]">
        {indoor.ppfd} · {indoor.fotoperiodo}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text)]">{indoor.nota}</p>
    </section>
  );
}
