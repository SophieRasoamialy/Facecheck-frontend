"use client";

import { useState } from "react";
import Swal from "sweetalert2";

import ModalShell from "@/components/ui/ModalShell";
import { createEnseignant, unwrapError } from "@/lib/api";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function AjoutModal({ isOpen, onClose, onSaved }: ModalProps) {
  const [nomProf, setNomProf] = useState("");
  const [prenomProf, setPrenomProf] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);
      await createEnseignant({
        nom_enseignant: nomProf.trim(),
        prenom_enseignant: prenomProf.trim(),
      });
      await Swal.fire("Succes", "Enseignant ajoute", "success");
      setNomProf("");
      setPrenomProf("");
      onSaved();
      onClose();
    } catch (error) {
      Swal.fire("Erreur", unwrapError(error, "Creation impossible"), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell
      isOpen={isOpen}
      title="Nouvel enseignant"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Fermer
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={saving || !nomProf.trim() || !prenomProf.trim()}
            className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Nom
          <input
            type="text"
            value={nomProf}
            onChange={(event) => setNomProf(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Prenom
          <input
            type="text"
            value={prenomProf}
            onChange={(event) => setPrenomProf(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
          />
        </label>
      </div>
    </ModalShell>
  );
}
