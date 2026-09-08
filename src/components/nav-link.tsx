"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({
  href,
  label,
  icona,
  segnale,
}: {
  href: string;
  label: string;
  icona: ReactNode;
  segnale?: boolean;
}) {
  const pathname = usePathname();
  const attivo = pathname.startsWith(href);

  return (
    <Link
      href={href}
      className="relative flex min-h-[56px] w-[76px] flex-col items-center justify-center gap-1"
      style={{ color: attivo ? "#fff" : "rgb(255 255 255 / 72%)" }}
    >
      {icona}
      <span className="font-sans text-[11px]" style={{ fontWeight: attivo ? 700 : 500 }}>
        {label}
      </span>
      {segnale && (
        <i
          className="absolute right-4 top-0 block h-2.5 w-2.5 rounded-full"
          style={{ background: "var(--color-casa)" }}
        />
      )}
    </Link>
  );
}
