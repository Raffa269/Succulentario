"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({ href, label, icona }: { href: string; label: string; icona: ReactNode }) {
  const pathname = usePathname();
  const attivo = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs"
      style={{ color: attivo ? "var(--color-fuori)" : "var(--color-text-secondary)" }}
    >
      {icona}
      <span className={attivo ? "font-medium" : undefined}>{label}</span>
    </Link>
  );
}
