import { cookies } from "next/headers";
import { COOKIE_CITTA, COOKIE_CLIMA, profiloClimaticoDaCookie, type ProfiloClimatico } from "@/lib/clima";

export async function climaCorrenteDaCookie(): Promise<ProfiloClimatico> {
  const store = await cookies();
  return profiloClimaticoDaCookie(store.get(COOKIE_CITTA)?.value, store.get(COOKIE_CLIMA)?.value);
}

