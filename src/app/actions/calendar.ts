"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { TIPI_INTERVENTO, type TipoIntervento } from "@/lib/calendario-interventi";

async function clientAutenticato() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autenticato.");
  return { supabase, userId: user.id };
}

function tipoValido(kind: string): kind is TipoIntervento {
  return TIPI_INTERVENTO.includes(kind as TipoIntervento);
}

export async function aggiungiIntervento(formData: FormData) {
  const { supabase, userId } = await clientAutenticato();
  const eventDate = String(formData.get("eventDate") ?? "").trim();
  const kind = String(formData.get("kind") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!eventDate) throw new Error("La data è obbligatoria.");
  if (!tipoValido(kind)) throw new Error("Tipo di intervento non valido.");
  if (kind === "nota" && !note) throw new Error("Scrivi una nota.");

  const { error } = await supabase.from("calendar_events").insert({
    owner: userId,
    event_date: eventDate,
    kind,
    note,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/calendario");
}

export async function eliminaIntervento(id: string) {
  const { supabase } = await clientAutenticato();
  const { error } = await supabase.from("calendar_events").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/calendario");
}
