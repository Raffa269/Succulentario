import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12">
      <header className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-[var(--color-text)]">Succulentario</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="h-10 rounded-lg border border-black/10 px-4 text-sm text-[var(--color-text-secondary)]"
          >
            Esci
          </button>
        </form>
      </header>

      <p className="text-[var(--color-text-secondary)]">
        Accesso eseguito come <strong>{user?.email}</strong>.
      </p>

      <div className="rounded-lg border border-black/10 bg-[var(--color-surface)] p-5">
        <p className="font-mono text-sm text-[var(--color-text-secondary)]">Tappa 1</p>
        <p className="mt-1 text-[var(--color-text)]">
          Ossatura pronta: Next.js, Supabase (database, storage, autenticazione),
          PWA installabile. Il catalogo (generi, varietà, guida) e la collezione
          personale arrivano nelle tappe successive.
        </p>
      </div>
    </main>
  );
}
