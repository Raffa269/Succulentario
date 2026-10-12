import type { CSSProperties } from "react";
import { illustrazioni } from "@/lib/catalogo";

/**
 * Disegno schematico del genere (dati/illustrazioni.json): SVG di linea,
 * `stroke="currentColor"`, quindi il colore si imposta con `className`.
 * Markup fidato — è un file versionato nel repo, non input dell'utente.
 */
export function IllustrazioneGenere({
  genereId,
  className,
  style,
}: {
  genereId: string;
  className?: string;
  style?: CSSProperties;
}) {
  const svg = illustrazioni[genereId];
  if (!svg) {
    return (
      <div className={className} style={style} aria-hidden="true">
        <svg viewBox="0 0 80 80" fill="none" className="h-full w-full">
          <path d="M40 66C28 52 22 38 25 24c11 3 17 14 15 31 2-17 8-28 19-31 3 14-3 28-19 42Z" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M40 66V28" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={style}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
