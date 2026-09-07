import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Destinazione dei link di conferma Supabase (magic link "di riserva", reset
 * password, inviti...): scambia il codice/token con una sessione e
 * reindirizza alla home (o alla pagina originaria via `next`).
 *
 * Gestisce sia il flusso PKCE (`code`, exchangeCodeForSession) sia quello a
 * token_hash (`token_hash` + `type`, verifyOtp) — pattern documentato da
 * Supabase per Next.js App Router.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    // Non è un URL relativo: mai fidarsi di `next` per evitare open redirect.
    next = "/";
  }

  if (code || (tokenHash && type)) {
    const supabase = await createClient();
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: type! });

    if (!error) {
      // Dietro il proxy di Vercel l'origin calcolato da request.url può
      // essere un host interno: x-forwarded-host porta il dominio pubblico
      // vero. In sviluppo locale non c'è alcun proxy, quindi si usa origin.
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(
      `${origin}/login?errore=${encodeURIComponent(error.code ?? error.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}/login?errore=parametri_mancanti`);
}
