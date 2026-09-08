import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Percorsi raggiungibili senza sessione attiva.
const PUBLIC_PATHS = ["/login", "/auth/callback", "/api/auth/request-otp"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// Copia sulla nuova response i cookie che Supabase ha eventualmente impostato
// (es. token rinnovato) durante getUser(): NextResponse.redirect() crea un
// oggetto response nuovo e da solo perderebbe quei cookie, facendo decadere
// la sessione a ogni giro di redirect senza motivo.
function redirectPreservingCookies(url: URL, from: NextResponse) {
  const to = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie));
  return to;
}

/**
 * Sostituisce il vecchio `middleware.ts` (rinominato `proxy.ts` in Next.js 16).
 * Rinnova la sessione Supabase a ogni richiesta e reindirizza al login chi
 * non è autenticato. Utente singolo: non esiste una pagina di registrazione.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, searchParams } = request.nextUrl;

  // Rete di sicurezza: un link di conferma Supabase (magic link, invito,
  // reset password...) porta sempre `code` o `token_hash` in query. Se per
  // una configurazione di redirect sbagliata (Site URL / Redirect URLs)
  // questi parametri arrivano su una pagina diversa da /auth/callback, li
  // inoltriamo comunque lì invece di mandare l'utente al login: senza
  // questo, il codice viene scartato in silenzio e si finisce in un loop
  // email → login → email.
  const hasAuthParams = searchParams.has("code") || searchParams.has("token_hash");
  if (!user && hasAuthParams && pathname !== "/auth/callback") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return redirectPreservingCookies(url, response);
  }

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return redirectPreservingCookies(url, response);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/collezione";
    return redirectPreservingCookies(url, response);
  }

  return response;
}

export const config = {
  matcher: [
    // Tutto tranne asset statici, immagini Next e file pubblici della PWA.
    "/((?!_next/static|_next/image|manifest\\.json|sw\\.js|icons/|favicon\\.ico).*)",
  ],
};
