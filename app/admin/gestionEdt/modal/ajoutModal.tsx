"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import ModalShell from "@/components/ui/ModalShell";
import {
  createTimetableEntry,
  getMatieresByNiveau,
  getNiveaux,
  getSalles,
  unwrapError,
} from "@/lib/api";
import type { Matiere, Niveau, Salle } from "@/lib/types";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  defaultNiveauId: string;
}

export default function AjoutModal({
  isOpen,
  onClose,
  onSaved,
  defaultNiveauId,
}: ModalProps) {
  const [date, setDate] = useState("");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [niveau, setNiveau] = useState(defaultNiveauId);
  const [matiere, setMatiere] = useState("");
  const [salle, setSalle] = useState("");
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNiveau(defaultNiveauId);
  }, [defaultNiveauId]);

  useEffect(() => {
    async function loadReferences() {
      if (!isOpen) {
        return;
      }

      try {
        const [loadedNiveaux, loadedSalles] = await Promise.all([getNiveaux(), getSalles()]);
        setNiveaux(loadedNiveaux);
        setSalles(loadedSalles);
      } catch (error) {
        Swal.fire("Erreur", unwrapError(error, "Chargement impossible"), "error");
      }
    }

    void loadReferences();
  }, [isOpen]);

  useEffect(() => {
    async function loadMatieres() {
      if (!niveau) {
        setMatieres([]);
        setMatiere("");
        return;
      }

      try {
        setMatieres(await getMatieresByNiveau(niveau));
      } catch (error) {
        Swal.fire("Erreur", unwrapError(error, "Chargement des matieres impossible"), "error");
      }
    }

    void loadMatieres();
  }, [niveau]);

  async function handleSave() {
    try {
      setSaving(true);
      await createTimetableEntry({
        date,
        heure: heureDebut,
        heure_fin: heureFin,
        id_niveau: Number(niveau),
        id_matiere: Number(matiere),
        id_salle: Number(salle),
      });
      await Swal.fire("Succes", "Cours ajoute", "success");
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
      title="Nouveau cours"
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
            disabled={saving || !date || !heureDebut || !heureFin || !niveau || !matiere || !salle}
            className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Date
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
          />
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
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Heure de debut
          <input
            type="time"
            value={heureDebut}
            onChange={(event) => setHeureDebut(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Heure de fin
          <input
            type="time"
            value={heureFin}
            onChange={(event) => setHeureFin(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Matiere
          <select
            value={matiere}
            onChange={(event) => setMatiere(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
          >
            <option value="">Choisir une matiere</option>
            {matieres.map((item) => (
              <option key={item.id_matiere} value={item.id_matiere}>
                {item.matiere}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Salle
          <select
            value={salle}
            onChange={(event) => setSalle(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
          >
            <option value="">Choisir une salle</option>
            {salles.map((item) => (
              <option key={item.num_salle} value={item.num_salle}>
                {item.num_salle}
              </option>
            ))}
          </select>
        </label>
      </div>
    </ModalShell>
  );
}
