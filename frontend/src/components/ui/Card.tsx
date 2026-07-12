import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {title ? <h3 className="mb-3 text-lg font-semibold text-slate-900">{title}</h3> : null}
      {children}
    </section>
  );
}
