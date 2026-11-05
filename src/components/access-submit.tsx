"use client";

import { useFormStatus } from "react-dom";

export function AccessSubmit({ name, value, children }: { name: string; value: string; children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <button name={name} value={value} disabled={pending} className="rounded-xl border px-4 py-2 disabled:opacity-50">
    {pending ? "Attendi…" : children}
  </button>;
}
