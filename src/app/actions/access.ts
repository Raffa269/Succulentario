"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isFreemium } from "@/lib/edition";

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
  const { error } = await supabase.from("access_requests").update({ status }).eq("user_id", id);
  if (error) throw new Error("Non è stato possibile aggiornare l’accesso.");
  revalidatePath("/amministrazione");
}
