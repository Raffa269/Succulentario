import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

export default async function AccessoInAttesa() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("access_requests").select("status").eq("user_id", user?.id ?? "").maybeSingle();
  return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-6">
    <h1 className="font-heading text-3xl">Succulentario</h1>
    <h2 className="text-xl">{data?.status === "rejected" ? "Richiesta non approvata" : "Richiesta ricevuta"}</h2>
    <p>Hai verificato l’indirizzo <strong>{user?.email}</strong>.</p>
    <p>{data?.status === "rejected" ? "Al momento il tuo accesso non è stato autorizzato." : "Raffaele deve approvare il tuo accesso. Dopo l’approvazione potrai creare fino a 5 schede pianta."}</p>
    <Link href="/collezione" className="rounded-xl border p-3 text-center">Controlla l’approvazione</Link>
    <form action={signOut}><button className="w-full p-3">Esci</button></form>
  </main>;
}
