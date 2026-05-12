"use client";

import { useState } from "react";
import { useEffect } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import AuthShell from "@/components/auth/AuthShell";
import { resetStudentPassword, unwrapError } from "@/lib/api";

export default function StudentResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") ?? "");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await resetStudentPassword({ token, password, confirmPassword });
      await Swal.fire("Succes", response.message, "success");
      router.push("/etudiant/login");
    } catch (error) {
      Swal.fire("Erreur", unwrapError(error, "Reinitialisation impossible"), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Etudiant"
      title="Choisir un nouveau mot de passe"
      description="Entrez votre token de reinitialisation puis votre nouveau mot de passe."
      backHref="/etudiant/login"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Token
          <input
            type="text"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 font-mono outline-none focus:border-teal-500"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Nouveau mot de passe
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Confirmation
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Mise a jour..." : "Reinitialiser le mot de passe"}
        </button>
      </form>
    </AuthShell>
  );
}
