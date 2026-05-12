"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState, useTransition } from "react";
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarIcon,
  UserGroupIcon,
  MenuIcon,
  XIcon,
} from "@heroicons/react/solid";
import { clearSession, readSession } from "@/lib/session";

const navItems = [
  {
    href: "/admin/gestionEdt",
    label: "Emploi du temps",
    icon: CalendarIcon,
  },
  {
    href: "/admin/gestionEtudiant",
    label: "Etudiants",
    icon: AcademicCapIcon,
  },
  {
    href: "/admin/gestionEnseignent",
    label: "Enseignants",
    icon: UserGroupIcon,
  },
  {
    href: "/admin/gestionMatiere",
    label: "Matieres",
    icon: BookOpenIcon,
  },
];

const authPages = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (authPages.includes(pathname)) {
      setIsAllowed(true);
      return;
    }

    const session = readSession("admin");
    if (!session) {
      router.replace("/admin/login");
      return;
    }

    setIsAllowed(true);
  }, [pathname, router]);

  useEffect(() => {
    setIsSidebarOpen(false);
    setPendingHref(null);
  }, [pathname]);

  if (authPages.includes(pathname)) {
    return <>{children}</>;
  }

  if (!isAllowed) {
    return null;
  }

  function handleNavigate(href: string) {
    setPendingHref(href);
    startTransition(() => {
      router.push(href);
    });
  }

  function handleLogout() {
    setPendingHref("/admin/login");
    clearSession("admin");
    startTransition(() => {
      router.push("/admin/login");
    });
  }

  function renderNav() {
    return (
      <>
        <nav className="space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            const loading = isPending && pendingHref === href;

            return (
              <button
                key={href}
                type="button"
                onClick={() => handleNavigate(href)}
                disabled={isPending}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? "bg-teal-600 text-white shadow-lg"
                    : "text-slate-700 hover:bg-teal-50"
                } disabled:cursor-not-allowed disabled:opacity-80`}
              >
                {loading ? (
                  <span
                    className={`h-5 w-5 animate-spin rounded-full border-2 ${
                      active
                        ? "border-white/30 border-t-white"
                        : "border-teal-200 border-t-teal-600"
                    }`}
                  />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {isPending && pendingHref === "/admin/login" ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            ) : (
              <ArrowLeftIcon className="h-5 w-5" />
            )}
            <span>Se deconnecter</span>
          </button>
        </div>
      </>
    );
  }

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),_transparent_45%),linear-gradient(180deg,_#f7fffd_0%,_#eef7f4_100%)]">
      {isPending ? (
        <div className="pointer-events-none fixed inset-0 z-40 bg-white/30 backdrop-blur-[1px]" />
      ) : null}

      <div className="mx-auto flex min-h-screen max-w-7xl gap-8 px-4 py-6 lg:px-6">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur lg:block">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
              Facecheck
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Admin Panel</h1>
            <p className="mt-2 text-sm text-slate-600">
              Gestion centralisee des emplois du temps, etudiants, enseignants et matieres.
            </p>
          </div>
          {renderNav()}
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between rounded-[1.75rem] border border-white/70 bg-white/85 p-4 shadow-lg backdrop-blur lg:hidden">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                Facecheck
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">Admin Panel</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm transition hover:bg-slate-50"
              aria-label="Ouvrir le menu"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-xl backdrop-blur sm:p-6">
            {children}
          </div>
        </main>
      </div>

      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          isSidebarOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-slate-950/35 transition-opacity ${
            isSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-[86%] max-w-sm border-r border-white/70 bg-white/95 p-6 shadow-2xl backdrop-blur transition-transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
                Facecheck
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Admin Panel</h2>
              <p className="mt-2 text-sm text-slate-600">
                Navigation rapide sur mobile et tablette.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm transition hover:bg-slate-50"
              aria-label="Fermer le menu"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          {renderNav()}
        </aside>
      </div>
    </section>
  );
}
