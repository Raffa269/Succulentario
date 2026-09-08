import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Invia il codice a 6 cifre di accesso via email.
 *
 * Solo codice, niente link cliccabile nel template email (Authentication →
 * Emails → Templates → Magic Link su Supabase, riscritto per mostrare solo
 * {{ .Token }}): un link avrebbe due problemi che il codice evita entrambi —
 * su iPhone toccarlo apre una webview di Mail con cookie separati da
 * Safari, dove il code_verifier PKCE non esiste e lo scambio fallisce
 * sempre; e gli scanner antiphishing di Gmail/Outlook aprono da soli i link
 * nelle email per controllarli, consumando il codice monouso prima ancora
 * che l'utente clicchi (causa reale già osservata: "parametri_mancanti" su
 * /auth/callback). `emailRedirectTo` resta impostato per compatibilità con
 * altri tipi di email Supabase (es. inviti), ma il template dell'accesso
 * non genera più nessun link da seguire.
 *
 * Utente singolo: l'indirizzo deve corrispondere a ALLOWED_LOGIN_EMAIL *e*
 * deve già esistere in Supabase Auth (shouldCreateUser: false) — doppia
 * barriera, non solo lato client.
 */
export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }

  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Indirizzo email non valido." }, { status: 400 });
  }

  const allowed = process.env.ALLOWED_LOGIN_EMAIL;
  if (allowed && email.trim().toLowerCase() !== allowed.trim().toLowerCase()) {
    return NextResponse.json(
      { error: "Questo Succulentario è privato: nessun accesso per questo indirizzo." },
      { status: 403 },
    );
  }

  const supabase = await createClient();
  const origin = new URL(request.url).origin;

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json(
      { error: "Non sono riuscito a inviare il codice di accesso. Riprova tra poco." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
