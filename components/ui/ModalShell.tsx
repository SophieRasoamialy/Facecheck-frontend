"use client";

import type { ReactNode } from "react";

interface ModalShellProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  isOpen: boolean;
}

export default function ModalShell({
  title,
  children,
  footer,
  isOpen,
}: ModalShellProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="mb-6 text-2xl font-bold text-slate-900">{title}</h3>
        <div>{children}</div>
        {footer ? <div className="mt-6 flex gap-3">{footer}</div> : null}
      </div>
    </div>
  );
}
