"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isFreemium } from "@/lib/edition";
import { decideAccess, type AccessStatus } from "@/lib/access-decision";
import { sendApprovalEmail } from "@/lib/approval-email";

export async function aggiornaAccesso(form: FormData) {
  if (!isFreemium) throw new Error("Funzione disponibile nella versione freemium.");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autenticato.");
  const { data: admin, error: adminError } = await supabase.rpc("is_access_admin");
  if (adminError || admin !== true) throw new Error("Non autorizzato.");
  const status = String(form.get("status"));
  const id = String(form.get("user_id"));
  if (!["approved", "rejected", "pending"].includes(status) || id === user.id) throw new Error("Richiesta non valida.");
  const { data: richiesta, error: readError } = await supabase.from("access_requests")
    .select("email,status,is_admin").eq("user_id", id).maybeSingle();
  if (readError || !richiesta || richiesta.is_admin) throw new Error("Richiesta non disponibile.");
  const result = await decideAccess(richiesta, status as AccessStatus, form.get("retry_email") === "true", {
    update: async (expected, next) => {
      const { data, error } = await supabase.from("access_requests").update({ status: next })
        .eq("user_id", id).eq("status", expected).select("user_id");
      if (error) throw new Error("Non è stato possibile aggiornare l’accesso.");
      return data?.length === 1;
    },
    notify: sendApprovalEmail,
  });
  revalidatePath("/amministrazione");
  redirect(`/amministrazione?esito=${result}`);
}
