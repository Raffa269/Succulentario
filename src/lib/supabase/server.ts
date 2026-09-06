import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase per Server Component, Route Handler e Server Action.
 * Legge/scrive i cookie di sessione tramite l'API `cookies()` di Next.js
 * (asincrona a partire da Next.js 16).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` chiamato da un Server Component: si può ignorare se il
            // proxy (proxy.ts) si occupa già di rinnovare la sessione.
          }
        },
      },
    },
  );
}
