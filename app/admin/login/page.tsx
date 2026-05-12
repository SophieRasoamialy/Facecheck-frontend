"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import AuthShell from "@/components/auth/AuthShell";
import { loginAdmin, unwrapError } from "@/lib/api";
import { saveSession } from "@/lib/session";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      const admin = await loginAdmin({ email, password });
      saveSession({ role: "admin", id: admin.id, email: admin.email });
      router.push("/admin/gestionEdt");
    } catch (error) {
      Swal.fire("Erreur", unwrapError(error, "Connexion impossible"), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Administration"
      title="Connexion admin"
      description="Connectez-vous avec votre email et votre mot de passe pour acceder a l'espace d'administration."
      backHref="/"
    >
      <div className="relative">
        {loading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/75 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
              <p className="text-sm font-medium text-slate-700">Connexion en cours...</p>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
              required
            />
          </label>
          <div className="flex justify-end">
            <Link href="/admin/forgot-password" className="text-sm font-medium text-teal-700 hover:text-teal-800">
              Mot de passe oublie ?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : null}
            <span>{loading ? "Connexion..." : "Se connecter"}</span>
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
