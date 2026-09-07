"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Stato = "idle" | "invio" | "codiceInviato" | "verifica" | "errore";

function FormLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [codice, setCodice] = useState("");
  const [stato, setStato] = useState<Stato>("idle");
  const [messaggio, setMessaggio] = useState<string | null>(() => {
    const errore = searchParams.get("errore");
    return errore
      ? `Il precedente tentativo di accesso non è riuscito (${errore}). Riprova qui sotto.`
      : null;
  });

  async function inviaCodice(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStato("invio");
    setMessaggio(null);

    try {
      const res = await fetch("/api/auth/request-otp", {
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

      setStato("codiceInviato");
    } catch {
      setStato("errore");
      setMessaggio("Non riesco a contattare il server. Controlla la connessione.");
    }
  }

  async function verificaCodice(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStato("verifica");
    setMessaggio(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: codice.trim(),
      type: "email",
    });

    if (error) {
      setStato("codiceInviato");
      setMessaggio("Codice non valido o scaduto. Controlla e riprova, o richiedine uno nuovo.");
      return;
    }

    // push + refresh, non solo push: refresh forza Next a rileggere i
    // Server Component dal server, dove proxy.ts deve rivedere i cookie di
    // sessione appena scritti dal client Supabase per lasciarci entrare.
    router.push("/");
    router.refresh();
  }

  const inCorsoVerifica = stato === "codiceInviato" || stato === "verifica";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl text-[var(--color-text)]">Succulentario</h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          Il catalogo personale della collezione di piante grasse.
        </p>

        {inCorsoVerifica ? (
          <form onSubmit={verificaCodice} className="mt-8 flex flex-col gap-4">
            <p className="text-[var(--color-text)]">
              Controlla la posta di <strong>{email}</strong>: trovi un link su cui toccare,
              e — appena disponibile — anche un codice da scrivere qui sotto.
            </p>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-[var(--color-text-secondary)]">
                Codice a 6 cifre (se presente nell&apos;email)
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={codice}
                onChange={(e) => setCodice(e.target.value)}
                className="h-11 rounded-lg border border-black/10 bg-[var(--color-surface)] px-3 text-center font-mono text-lg tracking-[0.3em] text-[var(--color-text)] outline-none focus:border-[var(--color-fuori)]"
                placeholder="123456"
              />
            </label>
            <button
              type="submit"
              disabled={stato === "verifica"}
              className="h-11 rounded-lg bg-[var(--color-fuori)] font-medium text-white disabled:opacity-60"
            >
              {stato === "verifica" ? "Verifica…" : "Entra"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStato("idle");
                setCodice("");
                setMessaggio(null);
              }}
              className="h-10 text-sm text-[var(--color-text-secondary)] underline underline-offset-2"
            >
              Usa un altro indirizzo
            </button>
          </form>
        ) : (
          <form onSubmit={inviaCodice} className="mt-8 flex flex-col gap-4">
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
              {stato === "invio" ? "Invio…" : "Invia il codice di accesso"}
            </button>
          </form>
        )}

        {messaggio && (
          <p className="mt-4 text-sm text-[var(--color-casa-esclamativo)]">{messaggio}</p>
        )}

        <p className="mt-10 text-sm text-[var(--color-text-secondary)]">
          Su iPhone: apri questa pagina in Safari, tocca <strong>Condividi</strong> →{" "}
          <strong>Aggiungi alla schermata Home</strong>, per usarla come un&apos;app.
        </p>
      </div>
    </main>
  );
}

export default function PaginaLogin() {
  return (
    <Suspense fallback={null}>
      <FormLogin />
    </Suspense>
  );
}
