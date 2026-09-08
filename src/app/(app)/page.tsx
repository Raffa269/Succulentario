import { redirect } from "next/navigation";

/** Collezione è la schermata di apertura: niente più una Home separata. */
export default function Home() {
  redirect("/collezione");
}
