"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import AuthShell from "@/components/auth/AuthShell";
import { forgotStudentPassword, unwrapError } from "@/lib/api";

export default function StudentForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await forgotStudentPassword({ email });
      setResetToken(response.resetToken ?? "");
      await Swal.fire("Succes", response.message, "success");

      if (response.resetToken) {
        router.push(`/etudiant/reset-password?token=${response.resetToken}`);
      }
    } catch (error) {
      Swal.fire("Erreur", unwrapError(error, "Operation impossible"), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Etudiant"
      title="Mot de passe oublie"
      description="Saisissez votre email. En environnement local, un token de reinitialisation sera genere."
      backHref="/etudiant/login"
    >
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
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Generation..." : "Generer un token"}
        </button>
      </form>

      {resetToken ? (
        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold">Token de reinitialisation</p>
          <p className="mt-2 break-all font-mono text-xs">{resetToken}</p>
          <Link href={`/etudiant/reset-password?token=${resetToken}`} className="mt-3 inline-block font-medium text-teal-700">
            Aller a la page de reinitialisation
          </Link>
        </div>
      ) : null}
    </AuthShell>
  );
}
