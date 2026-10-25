import Link from "next/link";
import { POSTER_COLLEZIONE_ABILITATO } from "./config";

export function LinkPosterCollezione() {
  if (!POSTER_COLLEZIONE_ABILITATO) return null;
  return (
    <Link href="/poster-collezione" aria-label="Poster collezione" title="Poster collezione"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 text-[var(--color-brand)]">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    </Link>
  );
}
