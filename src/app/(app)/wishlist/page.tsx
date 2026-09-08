import Link from "next/link";
import { caricaPiante } from "@/lib/piante-server";
import { getVarietaByKey } from "@/lib/catalogo";
import { WishlistCard } from "@/components/wishlist-card";
import { AppHeader } from "@/components/app-header";

export const metadata = { title: "Wishlist · Succulentario" };

export default async function PaginaWishlist() {
  const { piante } = await caricaPiante("wishlist");

  return (
    <div className="relative mx-auto max-w-2xl px-4 pb-8 pt-3">
      <AppHeader />
      <h1 className="mb-1 font-heading text-[26px] text-[var(--color-text)]">Wishlist</h1>
      <p className="mb-[18px] text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
        {piante.length === 0
          ? "Vuota per ora. Vai su un genere e tocca «La voglio»."
          : `${piante.length} ${piante.length === 1 ? "varietà" : "varietà"}.`}
      </p>

      <div className="flex flex-col gap-2.5">
        {piante.map((p) => (
          <WishlistCard key={p.id} plant={p} ricovero={p.var_key ? getVarietaByKey(p.var_key)?.ricovero : undefined} />
        ))}
      </div>

      <Link
        href="/piante/nuova?kind=wishlist"
        className="fixed bottom-24 right-4 z-10 flex h-14 items-center gap-2 rounded-full pl-5 pr-6 text-white"
        style={{ background: "var(--color-riparo)", boxShadow: "var(--shadow-md)" }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span className="font-heading text-[17px]">Aggiungi</span>
      </Link>
    </div>
  );
}
