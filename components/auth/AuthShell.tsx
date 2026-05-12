"use client";

import type { ReactNode } from "react";
import Link from "next/link";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  backHref: string;
}

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
  backHref,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.16),_transparent_40%),linear-gradient(180deg,_#f8fffd_0%,_#eef7f3_100%)] px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex justify-end">
          <Link
            href={backHref}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Retour
          </Link>
        </div>

        <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-2xl backdrop-blur sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
