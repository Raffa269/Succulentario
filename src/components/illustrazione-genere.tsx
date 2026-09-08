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
  if (!svg) return null;

  return (
    <div
      className={className}
      style={style}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
