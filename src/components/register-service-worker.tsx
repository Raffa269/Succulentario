"use client";

import { useEffect } from "react";

/**
 * Registra il service worker per rendere l'app installabile e consultabile
 * offline (schede, guida, elenco varietà — vedi SPECIFICA.md §12).
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Non bloccante: l'app funziona anche senza service worker attivo.
      });
    }
  }, []);

  return null;
}
