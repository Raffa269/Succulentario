import Link from "next/link";

/**
 * Intestazione condivisa dalle schermate principali (mockup 1a/1e/1i/1h):
 * germoglio + wordmark "Succulentario" in Caprasimo/prugna, hamburger verso
 * /impostazioni. Ogni pagina la include da sé — src/app/(app)/layout.tsx
 * porta solo la barra di navigazione in basso.
 */
export function AppHeader() {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth={2.4}
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 21v-7" />
          <path d="M12 14c0-3 2-5 5-5 0 3-2 5-5 5z" />
          <path d="M12 14c0-3-2-5-5-5 0 3 2 5 5 5z" />
          <path d="M12 12c0-3.5 1.4-6 3-8-2.6.6-4 3-4 5" />
        </svg>
        <span className="font-heading text-[23px]" style={{ color: "var(--color-brand)" }}>
          Succulentario
        </span>
      </div>
      <Link
        href="/impostazioni"
        aria-label="Impostazioni"
        className="flex h-11 w-11 items-center justify-center"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text)"
          strokeWidth={2.75}
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M3 6h18M3 12h12M3 18h7" />
        </svg>
      </Link>
    </div>
  );
}
