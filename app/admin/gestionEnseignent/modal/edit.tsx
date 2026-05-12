"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import ModalShell from "@/components/ui/ModalShell";
import { getEnseignant, unwrapError, updateEnseignant } from "@/lib/api";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  id_enseignant: number;
  onSaved: () => void;
}

export default function EditModal({
  isOpen,
  onClose,
  id_enseignant,
  onSaved,
}: ModalProps) {
  const [nomProf, setNomProf] = useState("");
  const [prenomProf, setPrenomProf] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadTeacher() {
      if (!isOpen || !id_enseignant) {
        return;
      }

      try {
        setLoading(true);
        const enseignant = await getEnseignant(id_enseignant);
        setNomProf(enseignant.nom_enseignant);
        setPrenomProf(enseignant.prenom_enseignant);
      } catch (error) {
        Swal.fire("Erreur", unwrapError(error, "Chargement impossible"), "error");
      } finally {
        setLoading(false);
      }
    }

    void loadTeacher();
  }, [id_enseignant, isOpen]);

  async function handleSave() {
    try {
      setSaving(true);
      await updateEnseignant(id_enseignant, {
        nom_enseignant: nomProf.trim(),
        prenom_enseignant: prenomProf.trim(),
      });
      await Swal.fire("Succes", "Enseignant mis a jour", "success");
      onSaved();
      onClose();
    } catch (error) {
      Swal.fire("Erreur", unwrapError(error, "Mise a jour impossible"), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell
      isOpen={isOpen}
      title="Modifier enseignant"
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
            disabled={loading || saving || !nomProf.trim() || !prenomProf.trim()}
            className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Mettre a jour"}
          </button>
        </>
      }
    >
      {loading ? (
        <p className="text-sm text-slate-500">Chargement...</p>
      ) : (
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
      )}
    </ModalShell>
  );
}
