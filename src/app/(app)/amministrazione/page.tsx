import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isFreemium } from "@/lib/edition";
import { aggiornaAccesso, verificaEmailAccesso } from "@/app/actions/access";
import { AppHeader } from "@/components/app-header";
import { AccessSubmit } from "@/components/access-submit";
import { approvalEmailConfigured } from "@/lib/approval-email";

export default async function Amministrazione({ searchParams }: { searchParams: Promise<{ esito?: string }> }) {
  if (!isFreemium) notFound();
  const supabase = await createClient();
  const { data: admin, error: adminError } = await supabase.rpc("is_access_admin");
  if (adminError || admin !== true) notFound();
  const { data, error } = await supabase.from("access_requests").select("user_id,email,status,created_at").order("created_at", { ascending: false });
  if (error) throw new Error("Impossibile caricare le richieste.");
  const { data: { user } } = await supabase.auth.getUser();
  const stati: Record<string, string> = { pending: "In attesa", approved: "Approvato", rejected: "Non approvato" };
  const { esito } = await searchParams;
  const messaggi: Record<string, string> = {
    smtp_ok: "Connessione riuscita: Gmail ha accettato le credenziali. Nessuna email inviata e nessun accesso modificato.",
    smtp_missing: "Mancano le credenziali SMTP nella configurazione del sito.",
    smtp_auth_failed: "Gmail non ha accettato le credenziali. Controlla l’indirizzo del mittente e la password per app Gmail (non la password normale).",
    smtp_connection_failed: "Non è stato possibile completare la connessione al server di posta. Riprova tra poco; se persiste, controlla host, porta e connessione.",
    email_sent: "Accesso approvato. Il server di posta ha accettato l’email di notifica.",
    email_failed: "L’accesso è approvato, ma l’invio dell’email non è riuscito. Usa «Invia di nuovo l’email» sulla richiesta interessata per ritentare.",
    updated: "Accesso aggiornato.", unchanged: "La richiesta era già in questo stato: nessuna email inviata.",
    stale: "La richiesta è stata modificata nel frattempo. Controlla lo stato e riprova se necessario.",
  };
  return <div className="mx-auto max-w-2xl space-y-4 px-4 py-4">
    <AppHeader /><h1 className="font-heading text-2xl">Richieste di accesso</h1>
    <p>Approva ogni persona per consentirle di usare il Succulentario. Dopo l’approvazione viene inviata un’email con il link per entrare.</p>
    {!approvalEmailConfigured() && <p role="alert" className="rounded-xl bg-amber-50 p-3">L’invio delle notifiche email deve essere configurato. Le approvazioni restano valide, ma gli utenti non ricevono ancora l’avviso automatico.</p>}
    {esito && messaggi[esito] && <p role={esito === "email_failed" ? "alert" : "status"} className="rounded-xl border p-3">{messaggi[esito]}</p>}
    <form action={verificaEmailAccesso}>
      <AccessSubmit name="verify_smtp" value="true">Verifica connessione email</AccessSubmit>
      <p className="mt-2 text-sm">Controlla le credenziali senza inviare email o modificare gli accessi.</p>
    </form>
    {!data?.length && <p>Nessuna richiesta ricevuta.</p>}
    {data?.map(r => <section key={r.user_id} className="space-y-3 rounded-2xl border border-black/10 p-4">
      <p className="break-all font-bold">{r.email}</p><p>{stati[r.status]}</p>
      <p className="text-sm">{new Date(r.created_at).toLocaleDateString("it-IT", { timeZone: "Europe/Rome" })}</p>
      {r.user_id !== user?.id && <form action={aggiornaAccesso} className="flex flex-wrap gap-3">
        <input type="hidden" name="user_id" value={r.user_id} />
        {r.status !== "approved" && <AccessSubmit name="status" value="approved">Approva e avvisa via email</AccessSubmit>}
        <AccessSubmit name="status" value="rejected">{r.status === "approved" ? "Revoca accesso" : "Rifiuta"}</AccessSubmit>
      </form>}
      {r.user_id !== user?.id && r.status === "approved" && <form action={aggiornaAccesso}>
        <input type="hidden" name="user_id" value={r.user_id} />
        <input type="hidden" name="status" value="approved" />
        <AccessSubmit name="retry_email" value="true">Invia di nuovo l’email</AccessSubmit>
      </form>}
    </section>)}
  </div>;
}
