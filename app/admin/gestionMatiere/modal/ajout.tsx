"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import ModalShell from "@/components/ui/ModalShell";
import {
  createMatiere,
  getEnseignantsList,
  getNiveaux,
  unwrapError,
} from "@/lib/api";
import type { Enseignant, Niveau } from "@/lib/types";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  selectedNiveau: string;
}

export default function AjoutModal({
  isOpen,
  onClose,
  onSaved,
  selectedNiveau,
}: ModalProps) {
  const [matiere, setMatiere] = useState("");
  const [prof, setProf] = useState("");
  const [niveau, setNiveau] = useState(selectedNiveau);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNiveau(selectedNiveau);
  }, [selectedNiveau]);

  useEffect(() => {
    async function loadReferences() {
      if (!isOpen) {
        return;
      }

      try {
        const [loadedNiveaux, loadedEnseignants] = await Promise.all([
          getNiveaux(),
          getEnseignantsList(),
        ]);
        setNiveaux(loadedNiveaux);
        setEnseignants(loadedEnseignants);
      } catch (error) {
        Swal.fire("Erreur", unwrapError(error, "Chargement impossible"), "error");
      }
    }

    void loadReferences();
  }, [isOpen]);

  async function handleSave() {
    try {
      setSaving(true);
      await createMatiere({
        matiere: matiere.trim(),
        id_enseignant: Number(prof),
        id_niveau: Number(niveau),
      });
      await Swal.fire("Succes", "Matiere ajoutee", "success");
      setMatiere("");
      setProf("");
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
      title="Nouvelle matiere"
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
            disabled={saving || !matiere.trim() || !prof || !niveau}
            className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Libelle
          <input
            type="text"
            value={matiere}
            onChange={(event) => setMatiere(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Enseignant
          <select
            value={prof}
            onChange={(event) => setProf(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
          >
            <option value="">Choisir un enseignant</option>
            {enseignants.map((enseignant) => (
              <option key={enseignant.id_enseignant} value={enseignant.id_enseignant}>
                {enseignant.nom_enseignant} {enseignant.prenom_enseignant}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Niveau
          <select
            value={niveau}
            onChange={(event) => setNiveau(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
          >
            <option value="">Choisir un niveau</option>
            {niveaux.map((item) => (
              <option key={item.id_niveau} value={item.id_niveau}>
                {item.niveau}
              </option>
            ))}
          </select>
        </label>
      </div>
    </ModalShell>
  );
}
