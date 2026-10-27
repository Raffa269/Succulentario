import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isFreemium } from "@/lib/edition";
import { aggiornaAccesso } from "@/app/actions/access";
import { AppHeader } from "@/components/app-header";

export default async function Amministrazione() {
  if (!isFreemium) notFound();
  const supabase = await createClient();
  const { data: admin, error: adminError } = await supabase.rpc("is_access_admin");
  if (adminError || admin !== true) notFound();
  const { data, error } = await supabase.from("access_requests").select("user_id,email,status,created_at").order("created_at", { ascending: false });
  if (error) throw new Error("Impossibile caricare le richieste.");
  const { data: { user } } = await supabase.auth.getUser();
  const stati: Record<string, string> = { pending: "In attesa", approved: "Approvato", rejected: "Non approvato" };
  return <div className="mx-auto max-w-2xl space-y-4 px-4 py-4">
    <AppHeader /><h1 className="font-heading text-2xl">Richieste di accesso</h1>
    <p>Approva ogni persona per consentirle di usare il Succulentario.</p>
    {!data?.length && <p>Nessuna richiesta ricevuta.</p>}
    {data?.map(r => <section key={r.user_id} className="space-y-3 rounded-2xl border border-black/10 p-4">
      <p className="break-all font-bold">{r.email}</p><p>{stati[r.status]}</p>
      <p className="text-sm">{new Date(r.created_at).toLocaleDateString("it-IT", { timeZone: "Europe/Rome" })}</p>
      {r.user_id !== user?.id && <form action={aggiornaAccesso} className="flex flex-wrap gap-3">
        <input type="hidden" name="user_id" value={r.user_id} />
        <button name="status" value="approved" className="rounded-xl border px-4 py-2">Approva</button>
        <button name="status" value="rejected" className="rounded-xl border px-4 py-2">{r.status === "approved" ? "Revoca accesso" : "Rifiuta"}</button>
      </form>}
    </section>)}
  </div>;
}
