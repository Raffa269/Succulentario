"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Stato = "idle" | "invio" | "codiceInviato" | "verifica" | "errore";

function LogoSucculentario() {
  return (
    <svg width="76" height="76" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth={1.9} strokeLinecap="round" aria-hidden="true">
      <path d="M12 21v-8" />
      <path d="M12 13c0-3.4 2.4-6 6-6 0 3.4-2.6 6-6 6z" />
      <path d="M12 13c0-3.4-2.4-6-6-6 0 3.4 2.6 6 6 6z" />
      <path d="M12 11c0-4 1.6-7 3.4-9.2C12.6 2.6 11 5.4 11 8" />
    </svg>
  );
}

/** Le sei celle sono solo visive: sotto c'è un unico input, per non rompere l'autofill del codice (SMS/email) del sistema operativo. */
function CelleCodice({ valore }: { valore: string }) {
  const cifre = Array.from({ length: 6 }, (_, i) => valore[i] ?? "");
  const posizioneAttiva = Math.min(valore.length, 5);
  return (
    <div className="flex gap-2.5" style={{ fontVariantNumeric: "tabular-nums" }}>
      {cifre.map((cifra, i) => (
        <div
          key={i}
          className="flex h-[66px] flex-1 items-center justify-center rounded-2xl bg-white font-heading text-[26px] text-[var(--color-text)]"
          style={{ border: i === posizioneAttiva ? "2px solid var(--color-brand)" : "1.5px solid rgba(32,30,29,.18)" }}
        >
          {cifra}
        </div>
      ))}
    </div>
  );
}

function FormLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [codice, setCodice] = useState("");
  const [stato, setStato] = useState<Stato>("idle");
  // Separato da `stato`: "Rimandalo" nella schermata del codice riusa lo
  // stesso "invio" della prima richiesta, ma senza tornare alla schermata
  // email nel frattempo.
  const [emailInviata, setEmailInviata] = useState(false);
  const [messaggio, setMessaggio] = useState<string | null>(() => {
    const errore = searchParams.get("errore");
    return errore
      ? `Il precedente tentativo di accesso non è riuscito (${errore}). Riprova qui sotto.`
      : null;
  });

  async function richiediCodice() {
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
      setEmailInviata(true);
    } catch {
      setStato("errore");
      setMessaggio("Non riesco a contattare il server. Controlla la connessione.");
    }
  }

  function inviaCodice(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    richiediCodice();
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

  const inCorsoVerifica = emailInviata;

  return (
    <main className="relative flex min-h-screen flex-col justify-center px-6 py-12" style={{ background: "var(--color-bg)" }}>
      <div className="mx-auto w-full max-w-sm">
        {inCorsoVerifica ? (
          <>
            <button
              type="button"
              onClick={() => {
                setStato("idle");
                setEmailInviata(false);
                setCodice("");
                setMessaggio(null);
              }}
              className="mb-8 flex h-11 items-center font-sans text-base font-bold"
              style={{ color: "var(--color-brand)" }}
            >
              Indietro
            </button>

            <h1 className="mb-2 font-heading text-[28px] text-[var(--color-text)]">Il codice</h1>
            <p className="mb-8 text-base leading-relaxed" style={{ color: "#3d3a33" }}>
              Sei cifre appena arrivate a <strong>{email}</strong>. Valgono dieci minuti.
            </p>

            <form onSubmit={verificaCodice} className="flex flex-col gap-4">
              <div className="relative">
                <CelleCodice valore={codice} />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  autoFocus
                  required
                  maxLength={6}
                  value={codice}
                  onChange={(e) => setCodice(e.target.value.replace(/\D/g, ""))}
                  className="absolute inset-0 h-full w-full text-center text-transparent outline-none"
                  style={{ caretColor: "transparent" }}
                  placeholder=""
                />
              </div>

              <button
                type="submit"
                disabled={stato === "verifica"}
                className="mt-1 h-14 rounded-2xl font-heading text-[17px] text-white disabled:opacity-60"
                style={{ background: "var(--color-brand)" }}
              >
                {stato === "verifica" ? "Verifica…" : "Entra"}
              </button>

              <button
                type="button"
                onClick={richiediCodice}
                disabled={stato === "invio"}
                className="h-10 font-sans text-[15px] font-medium disabled:opacity-60"
                style={{ color: "var(--color-brand)" }}
              >
                {stato === "invio" ? "Invio…" : "Rimandalo"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-11 flex flex-col items-center">
              <LogoSucculentario />
              <h1 className="mt-3.5 font-heading text-[32px] text-[var(--color-brand)]">Succulentario</h1>
              <p className="mt-2 font-sans text-[15px] font-medium text-[var(--color-text-secondary)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                525 varietà, 11 generi
              </p>
            </div>

            <form onSubmit={inviaCodice} className="flex flex-col gap-3">
              <div>
                <span className="mb-2 block font-sans text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Email
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 w-full rounded-2xl bg-white px-4 text-[17px] text-[var(--color-text)] outline-none"
                  style={{ border: "2px solid var(--color-brand)" }}
                  placeholder="tu@esempio.it"
                />
              </div>

              <button
                type="submit"
                disabled={stato === "invio"}
                className="h-14 rounded-2xl font-heading text-[17px] text-white disabled:opacity-60"
                style={{ background: "var(--color-brand)" }}
              >
                {stato === "invio" ? "Invio…" : "Mandami il codice"}
              </button>
            </form>
          </>
        )}

        {messaggio && (
          <p className="mt-4 text-sm text-[var(--color-casa-esclamativo)]">{messaggio}</p>
        )}

        {!inCorsoVerifica && (
          <p className="mt-10 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Su iPhone: apri questa pagina in Safari, tocca <strong>Condividi</strong> →{" "}
            <strong>Aggiungi alla schermata Home</strong>, per usarla come un&apos;app.
          </p>
        )}
      </div>

      {!inCorsoVerifica && (
        <p className="absolute inset-x-0 bottom-8 text-center font-sans text-[13px] font-medium text-[var(--color-text-secondary)]">
          Nessuna password, nessun account.
        </p>
      )}
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
