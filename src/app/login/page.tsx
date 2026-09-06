"use client";

import { useState, type FormEvent } from "react";

type Stato = "idle" | "invio" | "inviato" | "errore";

export default function PaginaLogin() {
  const [email, setEmail] = useState("");
  const [stato, setStato] = useState<Stato>("idle");
  const [messaggio, setMessaggio] = useState<string | null>(null);

  async function inviaLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStato("invio");
    setMessaggio(null);

    try {
      const res = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const dati = await res.json();

      if (!res.ok) {
        setStato("errore");
        setMessaggio(dati.error ?? "Qualcosa è andato storto.");
        return;
      }

      setStato("inviato");
    } catch {
      setStato("errore");
      setMessaggio("Non riesco a contattare il server. Controlla la connessione.");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl text-[var(--color-text)]">Succulentario</h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          Il catalogo personale della collezione di piante grasse.
        </p>

        {stato === "inviato" ? (
          <div className="mt-8 rounded-lg border border-[var(--color-fuori)]/30 bg-[var(--color-fuori)]/10 p-4 text-[var(--color-text)]">
            <p>
              Controlla la posta di <strong>{email}</strong>: se l&apos;indirizzo è
              autorizzato, il link di accesso è in arrivo.
            </p>
          </div>
        ) : (
          <form onSubmit={inviaLink} className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-[var(--color-text-secondary)]">
                Indirizzo email
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg border border-black/10 bg-[var(--color-surface)] px-3 text-base text-[var(--color-text)] outline-none focus:border-[var(--color-fuori)]"
                placeholder="tu@esempio.it"
              />
            </label>

            <button
              type="submit"
              disabled={stato === "invio"}
              className="h-11 rounded-lg bg-[var(--color-fuori)] font-medium text-white disabled:opacity-60"
            >
              {stato === "invio" ? "Invio…" : "Invia il link di accesso"}
            </button>

            {stato === "errore" && messaggio && (
              <p className="text-sm text-[var(--color-casa-esclamativo)]">{messaggio}</p>
            )}
          </form>
        )}

        <p className="mt-10 text-sm text-[var(--color-text-secondary)]">
          Su iPhone: apri questa pagina in Safari, tocca <strong>Condividi</strong> →{" "}
          <strong>Aggiungi alla schermata Home</strong>, per usarla come un&apos;app.
        </p>
      </div>
    </main>
  );
}
