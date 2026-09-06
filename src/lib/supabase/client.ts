import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase per componenti client-side (browser).
 * Usa la anon key, pubblica per design: la sicurezza vera sta nelle policy RLS.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
